class WatchRunPlugin {

  constructor(target) {
    this.target = target;
  }

  apply(compiler) {
    compiler.hooks.watchRun.tap("WatchRun", comp => {
      const changedTimes = comp.watchFileSystem.watcher.mtimes;
      const changedFiles = Object.keys(changedTimes)
        .map(file => `\n  ${file}`)
        .join("");
      if (changedFiles.length) {
        console.log(`[target:${this.target}:file:${changedFiles.trim()}]`, );
      }
    });
  }
}

module.exports = {
  WatchRunPlugin
};
