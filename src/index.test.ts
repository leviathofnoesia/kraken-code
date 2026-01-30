// Minimal test plugin - exports empty hooks
export default async function createTestPlugin(input: any): Promise<any> {
  console.log("[test-plugin] Loaded");
  return {};
}
