export function hasWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return (
      typeof window.WebGLRenderingContext !== "undefined" &&
      Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}
