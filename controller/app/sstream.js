
module.exports = stream => {
    let chunks = [];
    return new Promise((resolve,reject) => {
        stream.on('data', data =>
            chunks.push(data)
        );
        stream.on('error', reject);
        stream.on('end', () =>
            resolve(Buffer.concat(chunks).toString('utf8'))
        );
    });
}
