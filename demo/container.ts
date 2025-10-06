import { sleepSync } from 'bun';
import { DockerClient } from '../src/client';

async function containerDemo() {
    // Initialize Docker client
    const client = new DockerClient({ url: 'http://localhost:2375/v1.51/' });
    if (!client) {
        console.error('Docker client could not be initialized');
        return;
    }

    console.log('=== Container Demo ===');

    try {
        // 1. List containers
        console.log('=> 1. Listing all containers:');
        const containers = await client.containers.list({ all: true });
        console.log(`Found ${containers.length} containers`);
        console.log(containers);
        console.log();

        // 2. Create a new container
        console.log('=> 2. Creating a new container:');
        const createResponse = await client.containers.create({
            name: 'demo-busybox',
            Image: 'busybox:latest',
            Cmd: ['echo', 'Hello from Docker Node!'],
            WorkingDir: '/',
            AttachStdout: true,
            AttachStderr: true
        });
        console.log(createResponse);
        console.log();

        // 3. Inspect the container
        console.log('=> 3. Inspecting the container:');
        const inspection = await client.containers.inspect(createResponse.Id);
        console.dir(inspection, { depth: null });
        console.log();

        // 4. Start the container
        console.log('=> 4. Starting the container:');
        await client.containers.start(createResponse.Id);
        console.log(`Created container :D`);
        console.log();

        // 5. Get container stats (while running)
        console.log('=> 5. Getting container stats:');
        try {
            const stats = await client.containers.stats(createResponse.Id);
            console.log(stats);
        } catch (error) {
            console.log('Container might have finished execution, stats not available');
        }
        console.log();

        // 6. Get container processes
        console.log('=> 6. Getting container processes:');
        try {
            const processes = await client.containers.top(createResponse.Id);
            console.log(processes);
        } catch (error) {
            console.log('Container might have finished execution, no processes to list');
        }
        console.log();

        // 7. Wait for container to finish
        console.log('=> 7. Waiting for container to finish:');
        await client.containers.wait(createResponse.Id);
        console.log('Container finished execution');
        console.log();

        // 8. Get container logs (using attach)
        // console.log('=> 8. Getting container logs:');
        // try {
        //     const logStream = await client.containers.attach(createResponse.Id, {
        //         logs: true,
        //         stream: false,
        //         stdout: true,
        //         stderr: true
        //     });
        //     logStream.on('stdout', console.log);
        //     logStream.once('end', () => console.log('End of logs'));
        // } catch (error) {
        //     console.log('Container logs may not be available after completion');
        // }

        // 9. Get filesystem changes
        console.log('=> 9. Getting filesystem changes:');
        const changes = await client.containers.getFilesystemChanges(createResponse.Id);
        console.log(changes);
        console.log();

        // 10. Export container
        console.log('=> 10. Exporting container:');
        await client.containers.export(createResponse.Id, 'temp/demo-container.tar');
        console.log('Container exported to temp/demo-container.tar');
        console.log();

        // 11. Update container (if it was running)
        console.log('=> 11. Updating container resources:');
        try {
            const updateResult = await client.containers.update(createResponse.Id, {
                Memory: 268435456, // 256MB
                CpuShares: 512
            });
            console.log(updateResult);
        } catch (error) {
            console.log('Container update failed (expected for finished containers)');
        }
        console.log();

        // 12. Rename container
        console.log('=> 12. Renaming container:');
        await client.containers.rename(createResponse.Id, 'demo-busybox-renamed');
        console.log('Container renamed successfully');
        console.log();
        
        // 13. Remove the container
        console.log('=> 13. Removing the container:');
        await client.containers.remove(createResponse.Id, { force: true });
        console.log('Container removed successfully');
        console.log();
        
        // 14. Error handling - try to inspect non-existent container
        console.log('=> 14. Error handling - inspecting non-existent container:');
        try {
            await client.containers.inspect('non-existent-container');
        } catch (error) {
            console.log(`Error caught: ${error}`);
            console.log('Expected output: ContainerNotFound error');
        }
        console.log();

        // 15. Prune containers
        console.log('=> 15. Pruning unused containers:');
        const pruneResult = await client.containers.prune();
        console.log(pruneResult);
        console.log();

        // 16. Create and test container for path operations
        console.log('=> 16. Creating container for path operations:');
        const volumeContainer = await client.containers.create({
            name: 'demo-path-container',
            Image: 'busybox:latest',
            Cmd: ['sh', '-c', 'echo "test file" > /tmp/test.txt && sleepSync 1'],
            AttachStdout: true,
            AttachStderr: true
        });
        console.log();
        
        await client.containers.start(volumeContainer.Id);
        await client.containers.wait(volumeContainer.Id);
        
        // Get path statistics
        console.log('=> 17. Getting path statistics:');
        const pathStat = await client.containers.pathStat(volumeContainer.Id, '/tmp');
        console.log(pathStat);
        console.log();
        
        // Archive operations
        console.log('=> 18. Creating archive from container path:');
        await client.containers.archive(volumeContainer.Id, {
            containerPath: '/tmp',
            outputPath: 'temp/container-archive.tar'
        });
        console.log('Archive created successfully');
        console.log();

        await client.containers.remove(volumeContainer.Id, { force: true });
    } catch (error) {
        console.error('Demo failed:', error);
    }
}

// Run the demo
containerDemo().catch(console.error);