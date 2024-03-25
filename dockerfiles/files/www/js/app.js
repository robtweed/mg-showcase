(async () => {
  async function go() {
    const {golgi} = await import('https://cdn.jsdelivr.net/gh/robtweed/golgi/src/golgi.min.js');
    const {urlPrefix} = await import('./urlprefix.js');

    let context = {
      assemblyPath: 'https://cdn.jsdelivr.net/npm/golgi-d3/assemblies/node_viewer/',
      componentPaths: {
        sbadmin: 'https://cdn.jsdelivr.net/gh/robtweed/golgi-sbadmin/components/',
        d3: 'https://cdn.jsdelivr.net/gh/robtweed/golgi-d3/components/',
      },
      request: async (url, method, body) => {
        url = urlPrefix + url;
        method = method || 'GET';
        let options = {
          method: method,
          headers: {
            'Content-type': 'application/json'
          }
        };
        if (body) {
          options.body = JSON.stringify(body);
        }
        let res = await fetch(url, options);
        return await res.json();
      }
    };

    golgi.logging = true;
    let rootComponent = await golgi.renderAssembly('root_assembly', 'body', context);

    // pre-load components that are needed later while things are quiet...

    setTimeout(async function() {
      let arr = ['sbadmin-content-page', 'sbadmin-spacer', 'sbadmin-card', 'sbadmin-card-header', 'sbadmin-card-body', 'sbadmin-card-text', 'sbadmin-form', 'sbadmin-input', 'sbadmin-textarea', 'sbadmin-button', 'sbadmin-modal', 'sbadmin-table', 'sbadmin-toast'];
      for (let name of arr) {
        let _module = await import(context.componentPaths.sbadmin + name + '.js');
        _module.load();
      }
    }, 500);

    setTimeout(async function() {
      let arr = ['d3-hierarchy-root', 'd3-node-box', 'd3-node-text', 'd3-child-node-button', 'd3-action-button', 'd3-link'];
      for (let name of arr) {
        let _module = await import(context.componentPaths.d3 + name + '.js');
        _module.load();
      }
    }, 1000);

  }

  document.addEventListener('DOMContentLoaded', function() {
    // wait for all defered scripts to load, so everything needed to get going in ready
    go();
  });

})();
