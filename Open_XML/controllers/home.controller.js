const multer = require("multer");
const fs = require("fs");
const unzipper = require("unzipper");
const xml2js = require("xml2js");
const parseString = require("xml2js").parseString;
const parser = new xml2js.Parser();
const Document = require("../models/Document");
const Segment = require("../models/Segment");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./file/");
    },
    filename: function(req, file, cb) {
        file.originalname = `${file.originalname.split(".")[0]}.zip`;
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

exports.uploadFile = upload.any();

exports.getFile = (req, res) => {
    res.render("index");
};

exports.createFileJson = (req, res) => {
    // console.log(req.files);
    var folder = req.files[0].filename.split(".")[0];
    var dir = `./config/${folder}/`;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    // req.files[0].filename = `${folder}.zip`;
    // console.log(req.files[0].filename);

    fs.createReadStream(`./file/${req.files[0].filename}`).pipe(
        unzipper.Extract({
            path: `./config/${folder}/`,
        })
    );

    if (fs.existsSync(`./config/${folder}/word/document.xml`)) {
        const XMLData = fs.readFileSync(`./config/${folder}/docProps/app.xml`, {
            encoding: "utf-8",
        });

        var pageCount = XMLData.split("<Pages>")
            .join(",")
            .split("</Pages>")
            .join(",")
            .split(",")[1];

        fs.readFile(`./config/${folder}/word/document.xml`, function(err, data) {
            parser.parseString(data, function(err, result) {
                const content = JSON.stringify(result);
                // console.log(content);
                fs.writeFile(
                    `./uploads/${folder.toLowerCase()}.json`,
                    content,
                    (err) => {
                        if (err) {
                            console.error(err);
                        }
                    }
                );

                if (result["w:document"]) {
                    const newDocument = new Document({
                        filename: folder.toLowerCase(),
                        ext: ".docx",
                        path: `${req.path}/${req.files[0].filename}`,
                        pages: pageCount,
                    });
                    newDocument.save();
                    // console.log(newDocument);
                    // console.dir(result["w:document"]["w:body"][0]["w:p"].length);

                    lineLength = result["w:document"]["w:body"][0]["w:p"].length;
                    for (let i = 0; i < lineLength; i++) {
                        let temp = result["w:document"]["w:body"][0]["w:p"][i]["w:r"];
                        let properties =
                            result["w:document"]["w:body"][0]["w:p"][i]["w:pPr"];
                        let textDoc = "";
                        if (temp && temp["0"]["w:t"]) {
                            if (temp["0"]["w:t"]["0"]["_"]) {
                                textDoc = temp["0"]["w:t"]["0"]["_"];
                            } else if (temp["0"]["w:t"]["0"]) {
                                textDoc = temp["0"]["w:t"]["0"];
                            }
                        }
                        // console.log(typeof textDoc);
                        // console.log(properties["0"]["w:rPr"]["0"]["w:b"] ? true : false);
                        if (textDoc != "") {
                            // console.log("ok");
                            const newSegment = new Segment({
                                document_id: newDocument.id,
                                text: textDoc,
                                bold: properties["0"]["w:rPr"]["0"]["w:b"] ? true : false,
                                underline: properties["0"]["w:rPr"]["0"]["w:u"] ? true : false,
                                strike: properties["0"]["w:rPr"]["0"]["w:strike"] ?
                                    true :
                                    false,
                                italic: properties["0"]["w:rPr"]["0"]["w:i"] ? true : false,
                            });
                            newSegment.save();
                            // console.log(newSegment);
                        }
                    }
                }
            });

            console.log("Done");
        });
    } else {
        console.log("Khong co folder");
    }

    res.status(200).send(req.files);
};