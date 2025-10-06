import { DockerClient } from '../src/client';

async function volumeDemo() {
    // Initialize Docker client
    const client = new DockerClient({ url: 'http://localhost:2375' });
    if (!client) {
        console.error('Docker client could not be initialized');
        return;
    }

    console.log('=== Volume Demo ===');

    try {
        // 1. List all volumes
        console.log('=> 1. Listing all volumes:');
        const volumes = await client.volumes.list();
        console.log(volumes);
        console.log();

        // 2. Create a new volume
        console.log('=> 2. Creating a new volume:');
        const newVolume = await client.volumes.create({ Name: 'demo-volume' });
        console.log(newVolume);
        console.log();

        // 3. Inspect the created volume
        console.log('=> 3. Inspecting the created volume:');
        const volumeInspection = await client.volumes.inspect(newVolume.Name);
        console.log(volumeInspection);
        console.log();

        // 4. Remove the volume
        console.log('=> 4. Removing the volume:');
        await client.volumes.remove(newVolume.Name);
        console.log('Volume removed successfully');
        console.log();

        // 5. Error handling - inspect non-existent volume
        console.log('=> 5. Error handling - inspecting non-existent volume:');
        try {
            await client.volumes.inspect('non-existent-volume');
        } catch (error) {
            console.log(`Error caught: ${error}`);
            console.log('Expected output: VolumeNotFound error');
        }
        console.log();

        // 6. Prune unused volumes
        console.log('=> 6. Pruning unused volumes:');
        const pruneResult = await client.volumes.prune({
            all: true
        });
        console.log(pruneResult);
    } catch (error) {
        console.error('Demo failed:', error);
    }
}

// Run the demo
volumeDemo().catch(console.error);