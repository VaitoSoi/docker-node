import { DockerClient } from '../src/client';

async function networkDemo() {
    // Initialize Docker client
    const client = new DockerClient({ url: 'http://localhost:2375/v1.51' });
    if (!client) {
        console.error('Docker client could not be initialized');
        return;
    }

    console.log('=== Network Demo ===');

    try {
        // 1. List networks
        console.log('=> 1. Listing all networks:');
        const networks = await client.networks.list();
        console.log(networks);
        console.log();

        // 2. Create a simple custom network
        console.log('=> 2. Creating a simple custom network:');
        const createNetworkResponse = await client.networks.create({
            Name: 'demo-network',
            Driver: 'bridge',
            Labels: {
                'demo': 'true',
                'purpose': 'testing'
            }
        });
        console.log(createNetworkResponse);
        console.log();

        // 3. Inspect the created network
        console.log('=> 3. Inspecting the created network:');
        const networkInspection = await client.networks.inspect(createNetworkResponse.Id);
        console.dir(networkInspection, { depth: null });
        console.log();

        // 4. Create containers for network operations
        console.log('=> 4. Creating containers for network operations:');
        const testingContainer = await client.containers.create({
            name: 'demo-container-1',
            Image: 'busybox:latest',
            Cmd: ['sleep', '30']
        });
        console.log(testingContainer);
        console.log();

        // 5. Connect container to the network (simplified)
        console.log('=> 5. Connecting container to the network:');
        try {
            await client.networks.connect(createNetworkResponse.Id, {
                Container: testingContainer.Id
            });
            console.log('Container connected to network successfully');
        } catch (error) {
            console.log('Connection may have failed due to missing image or network issues');
        }
        console.log();

        // 6. Inspect network again to see connected containers
        console.log('=> 6. Inspecting network with connected container:');
        const updatedNetworkInspection = await client.networks.inspect(createNetworkResponse.Id);
        console.dir(updatedNetworkInspection, { depth: null });
        console.log();

        // 7. Disconnect container from network
        console.log('=> 7. Disconnecting container from network:');
        try {
            await client.networks.disconnect(createNetworkResponse.Id, {
                Container: testingContainer.Id
            });
            console.log('Container disconnected from network');
        } catch (error) {
            console.log('Disconnect may have failed - container might not be connected');
        }
        console.log();

        // 8. Clean up container
        console.log('=> 8. Cleaning up container:');
        await client.containers.remove(testingContainer.Id, { force: true });
        console.log('Container removed successfully');
        console.log();

        // 9. Remove the custom network
        console.log('=> 9. Removing the custom network:');
        await client.networks.remove(createNetworkResponse.Id);
        console.log('Network removed successfully');
        console.log();

        // 10. Error handling - inspect non-existent network
        console.log('=> 10. Error handling - inspecting non-existent network:');
        try {
            await client.networks.inspect('non-existent-network');
        } catch (error) {
            console.log(`Error caught: ${error}`);
            console.log('Expected output: NetworkNotFound error');
        }
        console.log();

        // 11. Prune unused networks
        console.log('=> 11. Pruning unused networks:');
        const pruneResult = await client.networks.prune();
        console.log(pruneResult);
        console.log();
    } catch (error) {
        console.error('Demo failed:', error);
    }
}

// Run the demo
networkDemo().catch(console.error);