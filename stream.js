const
  fs = require("fs"),
  csv = require("csv"),
  yargs = require("yargs");

async function isFile(p) {
  return new Promise((resolve, reject) => {
    fs.stat(p, (err, data) => {
      if (err) {
        return resolve(false);
      }
      return resolve(data.isFile());
    });
  });
}

function gatherArgs() {
  return yargs.option("input", {
    alias: "i",
    type: "string",
    description: "input file",
    required: true
  }).option("output", {
    alias: "o",
    type: "string",
    description: "output file",
    required: true
  }).option("secret", {
    alias: "s",
    type: "string",
    description: "client secret",
    required: true
  }).option("force", {
    alias: "f",
    type: "boolean",
  }).help()
    .argv;
}

async function validateArgs(args) {
  if (!await isFile(args.input)) {
    throw new Error(`input file not found: ${args.input}`);
  }
  if (await isFile(args.output)) {
    if (!args.force) {
      throw new Error(`output file already exists: ${args.output}\n(specify --force to overwrite)`);
    }
  }
}

function performProcessing(
  inputFile,
  outputFile,
  secret) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFile, { encoding: "utf8" })
      .pipe(csv.parse())
      .pipe(
        csv.transform(
          record => {
            // more complex logic should go here
            return record.concat([secret]);
          })
      ).pipe(
        csv.stringify()
      ).pipe(fs.createWriteStream(outputFile))
      .on("end", resolve)
      .on("error", reject);
  });
}

(async function () {
  try {
    const
      args = gatherArgs();
    await validateArgs(args);
    await performProcessing(args.input, args.output, args.secret);
    process.exit(0);
  } catch (e) {
    console.error(`${e.message}\n`);
    process.exit(1);
  }
})();
