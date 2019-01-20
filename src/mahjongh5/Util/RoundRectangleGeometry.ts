import * as Three from "three";

export default function RoundEdgedBox(w: number, h: number, r: number, s: number) {
    const coner1 = new Three.CircleGeometry(r, s, 0, Math.PI / 2);
    const coner2 = coner1.clone().rotateZ(Math.PI / 2);
    const coner3 = coner1.clone().rotateZ(Math.PI);
    const coner4 = coner1.clone().rotateZ(-Math.PI / 2);
    const halfW = w / 2 - r;
    const halfH = h / 2 - r;
    coner1.translate( halfW,  halfH, 0);
    coner2.translate(-halfW,  halfH, 0);
    coner3.translate(-halfW, -halfH, 0);
    coner4.translate( halfW, -halfH, 0);
    coner1.merge(coner2);
    coner1.merge(coner3);
    coner1.merge(coner4);
    const rec1 = new Three.PlaneGeometry(halfW * 2, h);
    const rec2 = new Three.PlaneGeometry(r, halfH * 2);
    const rec3 = rec2.clone();
    rec2.translate(-halfW - r / 2, 0, 0);
    rec3.translate( halfW + r / 2, 0, 0);
    rec1.merge(rec2);
    rec1.merge(rec3);
    rec1.merge(coner1);

    return new Three.BufferGeometry().fromGeometry(rec1);
}
