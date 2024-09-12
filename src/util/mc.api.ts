import axios from "axios";

interface VersionApi {
  name_raw: string;
  name_clean: string;
  name_html: string;
  protocol: number;
}

interface UserApi {
  uuid: string;
  name_raw: string;
  name_clean: string;
  name_html: string;
}

interface UsersApi {
  online: number;
  max: number;
  list: UserApi[];
}

interface MotdApi {
  raw: string;
  clean: string;
  html: string;
}

interface DataApi {
  online: boolean;
  host: string;
  port: number;
  ip_address: string;
  eula_blocked: boolean;
  retrieved_at: number;
  expires_at: number;
  version: VersionApi;
  players: UsersApi;
  motd: MotdApi;
  icon: string | null;
  mods: string[];
  software: string | null;
  plugins: string[];
  srv_record: string | null;
}

export class MinecraftAPI {
  private BASE_URL = "https://api.mcstatus.io/v2";

  constructor(public address: string, public type: "java" | "bedrock" = "java") {}

  async getInfo(): Promise<DataApi> {
    const uri = `${this.BASE_URL}/status/${this.type}/${this.address}`;

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.get<DataApi>(uri);

        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getWidget(): Promise<Buffer> {
    const uri = `${this.BASE_URL}/widget/${this.type}/${this.address}`;

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.get(uri, {
          params: {
            dark: true,
            rounded: true,
            timeout: 5,
          },
          responseType: "arraybuffer",
        });

        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    });
  }
}
