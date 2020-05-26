require("expect-more-jest");
const
  URI = require("urijs"),
  { v4 } = require("uuid"),
  uuid = v4,
  { transform, iraasBaseUrl, bigStoreResourceUrl } = require("./transform"),
  faker = require("faker");

describe(`transform`, () => {
  it(`should return an iraas url`, async () => {
    // Arrange
    const row = [
        makeBarcode(),
        makeFormat(),
        makeWidth(),
        makeHeight()
      ],
      clientId = uuid(),
      secret = makeSecret(),
      iraasUri = new URI(iraasBaseUrl);
    // Act
    const result = transform(row, clientId, secret);
    // Assert
    expect(result)
      .toBeArray();
    expect(result)
      .toHaveLength(row.length + 1)
    expect(result.slice(0, result.length - 1))
      .toEqual(row);
    const uri = new URI(result[result.length - 1]);
    expect(uri.host())
      .toEqual(iraasUri.host());
  })

  it(`should have the image url set as a big-store resource url`, async () => {
    // Arrange
    const row = [
        makeBarcode(),
        makeFormat(),
        makeWidth(),
        makeHeight()
      ],
      clientId = uuid(),
      secret = makeSecret();
    // Act
    const transformed = transform(row, clientId, secret);
    // Assert
    const
      url = transformed[transformed.length - 1],
      uri = new URI(url),
      query = uri.query(),
      searchParams = new URLSearchParams(query),
      bigStoreUrl = searchParams.get("url");

    expect(bigStoreUrl)
      .toBeDefined();
    // this proves that the resource url starts with the base big-store resource url
    expect(bigStoreUrl.indexOf(bigStoreResourceUrl))
      .toEqual(0);
  });

  function makeBarcode() {
    return faker.random.alphaNumeric(10);
  }

  function makeFormat() {
    return faker.random.arrayElement([ "png", "bmp", "jpg" ]);
  }

  function makeWidth() {
    return faker.random.number({ min: 400, max: 1024 });
  }

  function makeHeight() {
    return faker.random.number({ min: 400, max: 800 });
  }

  function makeSecret() {
    return faker.random.words(2);
  }
});
