import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  { ignores: ["src/generated/**"] },
  ...nextCoreWebVitals,
];

export default eslintConfig;
