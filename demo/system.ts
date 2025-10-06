import { DockerClient } from '../src/client';

async function systemDemo() {
    // Initialize Docker client
    const client = new DockerClient({ url: 'http://localhost:2375' });
    if (!client) {
        console.error('Docker client could not be initialized');
        return;
    }

    console.log('=== System Demo ===\n');

    try {
        // 1. Get Docker system info
        console.log('=> 1. Getting Docker system information:');
        const systemInfo = await client.systems.info();
        console.log(systemInfo);
        console.log();

        // 2. Get Docker version info
        console.log('=> 2. Getting Docker version information:');
        const versionInfo = await client.systems.version();
        console.log(versionInfo);
        console.log();

        // 3. Get system usage statistics
        console.log('=> 3. Getting system usage statistics:');
        const usageStats = await client.systems.usage();
        console.log(usageStats);
        console.log();

        // 4. Test authentication (if registry credentials available)
        console.log('=> 4. Testing authentication (will skip if no credentials):');
        try {
            const authResult = await client.systems.auth({
                username: 'testuser',
                password: 'testpass',
                email: 'test@example.com',
                serveraddress: 'https://index.docker.io/v1/'
            });
            console.log(authResult);
        } catch (error) {
            console.log('Authentication test skipped (invalid credentials expected)');
        }
        console.log();
    } catch (error) {
        console.error('Demo failed:', error);
    }
}

// Run the demo
systemDemo().catch(console.error);