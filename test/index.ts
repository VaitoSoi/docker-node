import axios from "axios";
import { Container } from "../src/components/container";

const api = axios.create({
    baseURL: "http://127.0.0.1:2375",
    // socketPath: "/var/run/docker.sock",
});
const container = new Container(api);

main().catch(console.error);
async function main() {
    // console.log(await container.list());
    const stream = await container.logs("4a226cdc39af", { stream: true, logs: true, stdout: true });
    stream.on('data', (buffer: Buffer) => console.log(buffer.toString()));
}