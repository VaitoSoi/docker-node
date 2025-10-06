import { DockerClient } from '../src/client';

async function imageDemo() {
    // Initialize Docker client
    const client = new DockerClient({ url: 'http://localhost:2375/v1.51/' });
    if (!client) {
        console.error('Docker client could not be initialized');
        return;
    }

    console.log('=== Image Demo ===\n');

    try {
        // 1. List images
        console.log('=> 1. Listing all images:');
        const images = await client.images.list();
        console.log(images);
        console.log();

        // 2. Pull busybox image (if not exists)
        console.log('=> 2. Ensuring busybox image exists:');
        const busyboxImages = images.filter(img => 
            img.RepoTags?.some(tag => tag.startsWith('busybox'))
        );
        if (busyboxImages.length === 0) {
            const stream = client.images.create({ fromImage: "busybox" });
            for await (const log of stream)
                console.log(stream);
        } else {
            console.log('Busybox image found locally');
        }
        console.log();

        // 3. Inspect an image
        console.log('=> 3. Inspecting busybox image:');
        try {
            const inspection = await client.images.inspect('busybox:latest');
            console.log(inspection);
        } catch (error) {
            console.log('Busybox image not found. Please pull it first: docker pull busybox:latest\n');
        }
        console.log();

        // 4. Get image history
        console.log('=> 4. Getting image history:');
        try {
            const history = await client.images.history('busybox:latest');
            console.log(history);
        } catch (error) {
            console.log('Could not get image history (image might not exist)\n');
        }
        console.log();

        // 5. Tag an image
        console.log('=> 5. Tagging busybox image:');
        try {
            await client.images.tag('busybox:latest', {
                repo: 'my-busybox',
                tag: 'demo'
            });
            console.log('Image tagged successfully as my-busybox:demo');
        } catch (error) {
            console.log('Could not tag image (source image might not exist)\n');
        }
        console.log();

        // 6. Search for images on Docker Hub
        console.log('=> 6. Searching for nginx images on Docker Hub:');
        try {
            const searchResults = await client.images.search({
                term: 'nginx',
                limit: 5
            });
            console.log(searchResults);
        } catch (error) {
            console.log('Search failed (network or API issue)\n');
        }
        console.log();

        // 7. Create image from container
        console.log('=> 7. Creating image from container:');
        try {
            // First create a container
            const container = await client.containers.create({
                name: 'demo-image-source',
                Image: 'busybox:latest',
                Cmd: ['sh', '-c', 'echo "demo content" > /demo.txt']
            });

            await client.containers.start(container.Id);
            await client.containers.wait(container.Id);

            // Create image from container
            const newImage = await client.images.createFromContainer({
                container: container.Id,
                repo: 'demo-created-image',
                tag: 'latest',
                comment: 'Image created from demo container'
            });
            console.log(newImage);
            
            // Clean up container
            await client.containers.remove(container.Id, { force: true });
        } catch (error) {
            console.log('Could not create image from container (base image might not exist)\n');
        }
        console.log();

        // 8. Export image
        console.log('=> 8. Exporting image:');
        try {
            await client.images.export('busybox:latest', {
                path: 'temp/busybox-export.tar',
            });
            console.log('Image exported to temp/busybox-export.tar');
        } catch (error) {
            console.log('Could not export image (image might not exist)\n');
        }
        console.log();

        // 9. Build cache operations (delete cache)
        console.log('=> 9. Managing build cache:');
        try {
            const deleteCacheResult = await client.images.deleteBuildCache();
            console.log(deleteCacheResult);
        } catch (error) {
            console.log('Could not delete build cache\n');
        }
        console.log();

        // 10. Search registry for specific image
        console.log('=> 10. Searching registry for busybox:');
        try {
            const registryInfo = await client.images.searchOnRegistry('busybox');
            console.log(registryInfo);
        } catch (error) {
            console.log('Registry search failed (network or authentication issue)\n');
        }
        console.log();

        // 11. Remove tagged image
        console.log('=> 11. Removing tagged image:');
        try {
            const removeResults = await client.images.remove('my-busybox:demo');
            console.log(removeResults);
        } catch (error) {
            console.log('Could not remove image (might not exist or be in use)\n');
        }
        console.log();

        // 12. Prune unused images
        console.log('=> 12. Pruning unused images:');
        const pruneResult = await client.images.prune();
        console.log(pruneResult);
        console.log();

        // 13. Error handling - inspect non-existent image
        console.log('=> 13. Error handling - inspecting non-existent image:');
        try {
            await client.images.inspect('non-existent-image:latest');
        } catch (error) {
            console.log(`Error caught: ${error}`);
            console.log('Expected output: ImageNotFound error\n');
        }
        console.log();

        // 14. Additional build cache operations with filters
        console.log('=> 14. Deleting build cache with options:');
        try {
            const deleteCacheResult = await client.images.deleteBuildCache({
                all: false,
                'reserved-space': 1024 * 1024 * 100 // Keep 100MB
            });
            console.log(deleteCacheResult);
        } catch (error) {
            console.log('Could not delete build cache with options\n');
        }
        console.log();
    } catch (error) {
        console.error('Demo failed:', error);
    }
}

// Run the demo
imageDemo().catch(console.error);