import { Canvas, Circle } from "@shopify/react-native-skia";

function SkiaTest() {
  return (
    <Canvas style={{ flex: 1 }}>
      <Circle cx={100} cy={100} r={50} color="red" />
    </Canvas>
  );
}
