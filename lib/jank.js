window.fs = { };
window.fs._cache = { };
window.fs._pending = { };
window.fs.cache = async(file, data) => { 
	if (window.fs._cache[file])
		return;
	if (!window.fs._pending[file])
		window.fs._pending[file] = fetch(file).then(response => response.arrayBuffer())
	window.fs._cache[file] = await window.fs._pending[file];
}
window.fs.readFileSync = (file, options) => {
	return window.fs._cache[file];
}
