import{mkdir,cp,copyFile}from'node:fs/promises';
await mkdir('dist/vendor',{recursive:true});await cp('src','dist',{recursive:true});
for(const f of ['three.module.js','three.core.js'])await copyFile('node_modules/three/build/'+f,'dist/vendor/'+f);
await mkdir('dist/vendor/addons/environments',{recursive:true});await copyFile('node_modules/three/examples/jsm/environments/RoomEnvironment.js','dist/vendor/addons/environments/RoomEnvironment.js');
console.log('Production build complete: dist (local assets, no CDN dependency)');

await copyFile('node_modules/three/LICENSE','dist/vendor/LICENSE.three.txt');
