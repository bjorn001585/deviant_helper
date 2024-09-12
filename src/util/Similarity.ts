import { IAliase } from "../structures/command";

interface SimilarityOptions {
  prefixScale?: number;
  prefixLength?: number;
}

export interface Result {
  mainString: string;
  foundString: string;
  command: string;
  similarity: number;
  target: IAliase['target']
}

interface ObjectWithAliases {
  aliases: IAliase[];
  command: string;
}

export class StringSimilarity {
  private prefixScale: number;
  private prefixLength: number;

  constructor(options: SimilarityOptions = {}) {
    this.prefixScale = options.prefixScale || 0.1;
    this.prefixLength = options.prefixLength || 4;
  }

  findSimilarStrings(
    inputString: string,
    objects: ObjectWithAliases[]
  ): Result[] {
    const results: Result[] = [];

    for (const obj of objects) {
      let maxSimilarity = 0;
      let bestAlias = "";
      let target = "" as IAliase['target'];

      for (const alias of obj.aliases) {
        const similarity = this.jaroWinkler(inputString, alias.name)
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          bestAlias = alias.name;
          target = alias.target
        }
      }

      results.push({
        mainString: inputString,
        foundString: bestAlias,
        command: obj.command,
        similarity: maxSimilarity,
        target: target
      });
    }

    const sortedResults = results.sort((a, b) => b.similarity - a.similarity);

    return sortedResults;
  }

  private cosine(str1: string, str2: string): number {
    function getCharacterFrequency(str: string): Map<string, number> {
      const frequency = new Map<string, number>();
      for (const char of str) {
        frequency.set(char, (frequency.get(char) || 0) + 1);
      }
      return frequency;
    }
    
    const frequency1 = getCharacterFrequency(str1);
    const frequency2 = getCharacterFrequency(str2);
    
    const dotProduct = [...frequency1.keys()].reduce((sum, char) => {
      return sum + (frequency1.get(char) || 0) * (frequency2.get(char) || 0);
    }, 0);
    
    const magnitude1 = Math.sqrt([...frequency1.values()].reduce((sum, frequency) => {
      return sum + frequency * frequency;
    }, 0));
    
    const magnitude2 = Math.sqrt([...frequency2.values()].reduce((sum, frequency) => {
      return sum + frequency * frequency;
    }, 0));
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  public jaroWinkler(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0 || len2 === 0) {
      return 0;
    }

    const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;

    const str1Matches = new Array(len1).fill(false);
    const str2Matches = new Array(len2).fill(false);

    let matchingCharacters = 0;

    for (let i = 0; i < len1; i++) {
      const start = Math.max(0, i - matchDistance);
      const end = Math.min(i + matchDistance + 1, len2);

      for (let j = start; j < end; j++) {
        if (!str2Matches[j] && str1[i] === str2[j]) {
          str1Matches[i] = true;
          str2Matches[j] = true;
          matchingCharacters++;
          break;
        }
      }
    }

    if (matchingCharacters === 0) {
      return 0;
    }

    let transpositions = 0;
    let k = 0;

    for (let i = 0; i < len1; i++) {
      if (str1Matches[i]) {
        let j = k;
        while (!str2Matches[j]) {
          j++;
        }
        if (str1[i] !== str2[j]) {
          transpositions++;
        }
        k = j + 1;
      }
    }

    const jaroSimilarity =
      (matchingCharacters / len1 +
        matchingCharacters / len2 +
        (matchingCharacters - transpositions / 2) / matchingCharacters) /
      3;

    if (jaroSimilarity < 0.7) {
      return jaroSimilarity;
    }

    const commonPrefixLength = this.getCommonPrefixLength(str1, str2);
    const prefixScaleFactor =
      this.prefixScale * commonPrefixLength * (1 - jaroSimilarity);

    const jaroWinklerSimilarity = jaroSimilarity + prefixScaleFactor;

    return jaroWinklerSimilarity;
  }

  private getCommonPrefixLength(str1: string, str2: string): number {
    const len1 = Math.min(str1.length, this.prefixLength);
    const len2 = Math.min(str2.length, this.prefixLength);

    let commonPrefixLength = 0;

    for (let i = 0; i < len2; i++) {
      if (str1[i] === str2[i]) {
        commonPrefixLength++;
      } else {
        break;
      }
    }

    return commonPrefixLength;
  }
}
