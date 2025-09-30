import DockerClient from "../src/client";

main()
async function main() {
    const client = new DockerClient({ url: "http://localhost:2375/v1.51/" });
    if (!client) return console.log("client not found");
    for await (const stream of client.images.create({
        fromImage: "alpine:latest"
    }))
        console.log(stream);
}