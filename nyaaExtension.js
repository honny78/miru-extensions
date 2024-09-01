class NyaaExtension {
    constructor() {}

    async searchNyaa(params) {
        const searchQuery = params.titles.join(' ');
        const url = `https://nyaa.si/?f=0&c=0_0&q=${encodeURIComponent(searchQuery)}&s=seeders&o=desc`;

        try {
            const response = await fetch(url);
            const text = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            const rows = doc.querySelectorAll('table.torrent-list tbody tr');
            let results = [];

            rows.forEach(row => {
                const titleElement = row.querySelector('td[colspan="2"] a');
                const linkElement = row.querySelector('a[href^="magnet:"]');
                const sizeElement = row.querySelector('td:nth-child(4)');
                const seedersElement = row.querySelector('td:nth-child(6)');
                const leechersElement = row.querySelector('td:nth-child(7)');

                if (titleElement && linkElement) {
                    results.push({
                        title: titleElement.textContent.trim(),
                        link: linkElement.href,
                        size: sizeElement ? this.parseSize(sizeElement.textContent.trim()) : 0,
                        seeders: seedersElement ? parseInt(seedersElement.textContent.trim()) : 0,
                        leechers: leechersElement ? parseInt(leechersElement.textContent.trim()) : 0,
                        date: new Date().toLocaleDateString(),
                        verified: false,
                        type: 'best',
                    });
                }
            });

            return results;
        } catch (error) {
            console.error("Error fetching data from Nyaa.si:", error);
            return [];
        }
    }

    parseSize(sizeStr) {
        const units = { 'B': 1, 'KiB': 1024, 'MiB': 1024 ** 2, 'GiB': 1024 ** 3, 'TiB': 1024 ** 4 };
        const [value, unit] = sizeStr.split(' ');
        return parseFloat(value) * (units[unit] || 1);
    }
}

Miru.registerExtension({
    name: "Nyaa.si Search",
    execute: async function(params) {
        const extension = new NyaaExtension();
        return await extension.searchNyaa(params);
    }
});
