import DockerClient from "../src/client";

main()
async function main() {
    const client = await DockerClient.fromEnv({ version: "1.50", suppressWarning: true });
    if (!client) return console.log("client not found");
    console.log(await client.systems.version());
}