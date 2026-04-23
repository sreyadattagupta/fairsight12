/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep onnxruntime packages out of the server bundle (native .node binaries)
  experimental: { serverComponentsExternalPackages: ["onnxruntime-node", "onnxruntime-web"] },

  webpack: (config, { isServer }) => {
    // Enable WASM for onnxruntime-web (client-side inference)
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    if (isServer) {
      // Externalize to avoid bundling native binaries
      config.externals = [...(Array.isArray(config.externals) ? config.externals : [config.externals].filter(Boolean)), "onnxruntime-node", "onnxruntime-web"];
    }

    return config;
  },
};

module.exports = nextConfig;
