const mountSDK = sdk => {
  return new Promise(resolve => {
    const node = document.createElement('script');
    document.head.appendChild(node);

    node.src = sdk.url;
    node.onload = function () {
      resolve(sdk.name);
    };
  });
};

export { mountSDK };
