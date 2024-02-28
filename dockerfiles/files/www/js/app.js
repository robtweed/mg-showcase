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
  }

  document.addEventListener('DOMContentLoaded', function() {
    // wait for all defered scripts to load, so everything needed to get going in ready
    go();
  });

})();
