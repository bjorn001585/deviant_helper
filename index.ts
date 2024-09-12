import { AlisterHelper } from "./src/core/index";

const client = new AlisterHelper();

client.processCommand();
client.processEvent();

client.connect(
  "",
);

// translate(model[lang].errors.title, {})
