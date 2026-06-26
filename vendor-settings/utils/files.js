// import fs from 'fs';
// import path from 'path';
// // Get files from a directory by a specific extension
// export function getFilesByExtension(dir) {
//     var extension = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : '.mdx';
//     if (!fs.existsSync(dir)) {
//         throw new Error("Directory ".concat(dir, " does not exist"));
//     }
//     return fs.readdirSync(dir).filter(function(file) {
//         return path.extname(file) === extension;
//     });
// }
// // Read file content with a default encoding (e.g., 'utf-8')
// export function readFileContent(filePath) {
//     var encoding = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'utf-8';
//     if (!fs.existsSync(filePath)) {
//         throw new Error("File ".concat(filePath, " does not exist"));
//     }
//     return fs.readFileSync(filePath, encoding);
// }
// // Get the slug from a file (filename without extension)
// export function getSlugFromFile(filePath) {
//     return path.basename(filePath, path.extname(filePath));
// }
// // Function to dynamically create directory if it doesn't exist (useful for file operations)
// export function ensureDirectoryExists(dir) {
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, {
//             recursive: true
//         });
//     }
// }
