const
  crypto = require("crypto"),
  iraasBaseUrl = "https://iraas.store.co.za",
  bigStoreResourceUrl = "https://www.store.co.za/resources",
  URI = require("urijs");

function createKey(key, data) {
  return crypto.createHmac("sha256", key)
    .update(data)
    .digest("hex");
}

module.exports = {
  createKey,
  iraasBaseUrl,
  bigStoreResourceUrl: bigStoreResourceUrl,
  transform: function transform(row, clientId, secret) {
    // barcode, format, width, height
    let
      barcode = row[0],
      format = row[1],
      width = row[2],
      height = row[3];

    const
      data = `${clientId}`,
      token = createKey(secret, data),
      resourceUri = new URI(bigStoreResourceUrl);

    resourceUri.addQuery("token", token);
    resourceUri.addQuery("barcode", barcode);

    // BIG STORE resource urls look like:
    // https://big-store.co.za/resource?barcode=1234&token=abc

    const iraasUri = new URI(iraasBaseUrl);
    // IRAAS likes urls like:
    // https://iraas.big-store.co.za?url=http://foo.bar.com/cat.jpg?width=100&format=png

    iraasUri.addQuery("url", resourceUri.toString());

    if (height) {
      iraasUri.addQuery("h", height)
    }
    if (width) {
      iraasUri.addQuery("w", width)
    }
    if (format) {
      iraasUri.addQuery("f", format);
    }

    return row.concat([iraasUri.toString()]);
  }
}
