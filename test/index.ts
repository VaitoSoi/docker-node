import DockerClient from "../src/client";

main()
async function main() {
    const client = new DockerClient({ url: "http://localhost:2375/v1.51/" });
    if (!client) return console.log("client not found");
    for await (const stream of client.images.build({ 
        t: "sss-test", 
        contextPath: "/home/vaito/code/sss-test",
        q: false,
        nocache: false,
        rm: true,
        dockerfile: 'a'
    }))
        console.log(stream);
}