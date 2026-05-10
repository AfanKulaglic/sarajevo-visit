/**
 * Converts all OBJ+MTL models to Draco-compressed GLB files.
 * GLB embeds geometry + materials + textures in a single binary,
 * with Draco compression reducing geometry by ~80-90%.
 *
 * Run: node scripts/convert-models.cjs
 */

const obj2gltf = require("../node_modules/obj2gltf");
const { processGlb } = require("../node_modules/gltf-pipeline");
const { promises: fs } = require("fs");
const path = require("path");

const modelsDir = path.join(__dirname, "../public/models");
const outDir = path.join(__dirname, "../public/models/glb");

const MODELS = [
  {
    id: "clock-tower",
    obj: path.join(modelsDir, "clock tower 3d model", "clock+tower+3d+model.obj"),
  },
  {
    id: "eternal-flame",
    obj: path.join(modelsDir, "eternal+flame+torus+3d+model", "tripo_convert_091b4a0e-0d85-4275-9f83-3a08883d05a0.obj"),
  },
  {
    id: "monument-children",
    obj: path.join(modelsDir, "Monument to the Murdered Children", "fountain+sculpture+3d+model.obj"),
  },
  {
    id: "multicultural-man",
    obj: path.join(modelsDir, "Multicultural Man", "metal+statue+3d+model.obj"),
  },
  {
    id: "sebilj",
    obj: path.join(modelsDir, "sebilj+3d+model", "tripo_convert_4af3f75b-f20c-49dd-a63e-a39b5d9fd165.obj"),
  },
  {
    id: "vijecnica",
    obj: path.join(modelsDir, "Vijećnica", "historic+building+3d+model.obj"),
  },
];

async function convert() {
  await fs.mkdir(outDir, { recursive: true });

  for (const model of MODELS) {
    const outPath = path.join(outDir, `${model.id}.glb`);
    process.stdout.write(`Converting ${model.id}...`);

    try {
      // Step 1: OBJ+MTL → GLB (textures embedded)
      const glbBuffer = await obj2gltf(model.obj, {
        binary: true,
        checkTransparency: false,
      });

      // Step 2: Draco compress the geometry (level 7 = good balance of speed/size)
      const { glb: compressed } = await processGlb(glbBuffer, {
        dracoOptions: { compressionLevel: 7 },
      });

      await fs.writeFile(outPath, compressed);

      const sizeMB = (compressed.length / 1024 / 1024).toFixed(1);
      const origMB = (await fs.stat(model.obj)).size / 1024 / 1024;
      const reduction = Math.round((1 - compressed.length / (origMB * 1024 * 1024)) * 100);
      console.log(` ✓  ${sizeMB} MB  (was ${origMB.toFixed(0)} MB, -${reduction}%)`);
    } catch (err) {
      console.log(` ✗  FAILED`);
      console.error(`   ${err.message}`);
    }
  }

  console.log("\nDone. GLB files are in public/models/glb/");
}

convert().catch(console.error);
