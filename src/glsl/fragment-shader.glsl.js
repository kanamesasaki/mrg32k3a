export default `#version 300 es
precision mediump float;

in vec4 vColor;
uniform vec2 uInverseTextureSize;
out vec4 fragColor;
uniform int uWidth;
uniform int uHeight;

// MRG32k3a parameters
uint[3] x1 = uint[3](0u, 0u, 1234567u);
uint[3] x2 = uint[3](0u, 0u, 1234567u);
const uint[9] a1 = uint[9](0u, 1u, 0u, 0u, 0u, 1u, 4294156359u, 1403580u, 0u);
const uint[9] a2 = uint[9](0u, 1u, 0u, 0u, 0u, 1u, 4293573854u, 0u, 527612u);
const uint m1 = 4294967087u;
const uint m2 = 4294944443u;
const uint a11 = 1403580u;
const uint a10 = 810728u;
const uint a22 = 527612u;
const uint a20 = 1370589u;

uint addModM(uint a, uint b, uint m) {
    uint amodm = a % m;
    uint bmodm = b % m;
    uint blim = m - amodm;
    if (bmodm <= blim) {
        return amodm + bmodm; 
    }
    else {
        return amodm - (m - bmodm);
    }
}

uint diffModM(uint a, uint b, uint m) {
    uint amodm = a % m;
    uint bmodm = b % m;
    if (amodm >= bmodm) {
        return amodm - bmodm;
    }
    else {
        return amodm + (m - bmodm);
    }
}

uint multModM(uint a, uint b, uint m) {
    uint amodm = a % m;
    uint bmodm = b % m;
    uint res = 0u;
    while (bmodm > 0u) {
        if ((bmodm&0x1u) == 0x1u) {
            res = addModM(res, amodm, m);
        }
        bmodm = bmodm >> 1;
        amodm = addModM(amodm, amodm, m);
    }
    return res;
}

// calculate c = a*b mod m
void matMultModM(uint[9] a, uint[9] b, uint m, out uint[9] c) {
    c[0] = addModM(addModM(multModM(a[0],b[0],m), multModM(a[1],b[3],m), m), multModM(a[2],b[6],m), m);
    c[1] = addModM(addModM(multModM(a[0],b[1],m), multModM(a[1],b[4],m), m), multModM(a[2],b[7],m), m);
    c[2] = addModM(addModM(multModM(a[0],b[2],m), multModM(a[1],b[5],m), m), multModM(a[2],b[8],m), m);
    c[3] = addModM(addModM(multModM(a[3],b[0],m), multModM(a[4],b[3],m), m), multModM(a[5],b[6],m), m);
    c[4] = addModM(addModM(multModM(a[3],b[1],m), multModM(a[4],b[4],m), m), multModM(a[5],b[7],m), m);
    c[5] = addModM(addModM(multModM(a[3],b[2],m), multModM(a[4],b[5],m), m), multModM(a[5],b[8],m), m);
    c[6] = addModM(addModM(multModM(a[6],b[0],m), multModM(a[7],b[3],m), m), multModM(a[8],b[6],m), m);
    c[7] = addModM(addModM(multModM(a[6],b[1],m), multModM(a[7],b[4],m), m), multModM(a[8],b[7],m), m);
    c[8] = addModM(addModM(multModM(a[6],b[2],m), multModM(a[7],b[5],m), m), multModM(a[8],b[8],m), m);
}

// calculate w = a*v mod m
void matVecMultModM(uint[9] a, uint[3] v, uint m, out uint[3] w) {
    w[0] = addModM(addModM(multModM(a[0],v[0],m), multModM(a[1],v[1],m), m), multModM(a[2],v[2],m), m);
    w[1] = addModM(addModM(multModM(a[3],v[0],m), multModM(a[4],v[1],m), m), multModM(a[5],v[2],m), m);
    w[2] = addModM(addModM(multModM(a[6],v[0],m), multModM(a[7],v[1],m), m), multModM(a[8],v[2],m), m);
}

// calculate c = a+b mod m
void matVecMultModM(uint[3] a, uint[3] b, uint m, out uint[9] c) {
    c[0] = addModM(a[0], b[0], m);
    c[1] = addModM(a[1], b[1], m);
    c[2] = addModM(a[2], b[2], m);
}

// calculate b = a**n mod m
void matPowModM(uint[9] a, uint n, uint m, out uint[9] b) {
    uint[9] apow = a;
    b = uint[9](1u, 0u, 0u, 0u, 1u, 0u, 0u, 0u, 1u);
    while (n > 0u) {
        if ((n&0x1u) == 0x1u) {
            matMultModM(apow, b, m, b);
        }
        n = n >> 1;
        matMultModM(apow, apow, m, apow);
    }
}

uint stepMRG32k3a(void) {
    uint x1i = diffModM(multModM(x1[1], a11, m1), multModM(x1[0], a10, m1), m1);
    uint x2i = diffModM(multModM(x2[2], a22, m2), multModM(x2[0], a20, m2), m2);
    x1[0] = x1[1];
    x1[1] = x1[2];
    x1[2] = x1i;
    x2[0] = x2[1];
    x2[1] = x2[2];
    x2[2] = x2i;
    return diffModM(x1i, x2i, m1);
}

uint skipMRG32k3a(uint n) {
    uint[9] a1pow;
    uint[9] a2pow;
    matPowModM(a1, n, m1, a1pow);
    matPowModM(a2, n, m2, a2pow);
    matVecMultModM(a1pow, x1, m1, x1);
    matVecMultModM(a2pow, x2, m2, x2);
    return diffModM(x1[0], x2[0], m1);
}

// convert int32 to vec4 color
vec4 intToVec4(int num) {
    int rIntValue = num & 0x000000FF;
    int gIntValue = (num & 0x0000FF00) >> 8;
    int bIntValue = (num & 0x00FF0000) >> 16;
    int aIntValue = (num & 0xFF000000) >> 24;
    vec4 numColor = vec4(float(rIntValue)/255.0, float(gIntValue)/255.0, float(bIntValue)/255.0, float(aIntValue)/255.0); 
    return numColor; 
}

// convert uint32 to vec4 color
vec4 uintToVec4(uint num) {
    uint rIntValue = num & 0x000000FFu;
    uint gIntValue = (num & 0x0000FF00u) >> 8;
    uint bIntValue = (num & 0x00FF0000u) >> 16;
    uint aIntValue = (num & 0xFF000000u) >> 24;
    vec4 numColor = vec4(float(rIntValue)/255.0, float(gIntValue)/255.0, float(bIntValue)/255.0, float(aIntValue)/255.0); 
    return numColor;
}

// convert float32 to vec4 color
vec4 floatToVec4(float val) {
    uint conv = floatBitsToUint(val);
    return uintToVec4(conv);
}

void main(void) {
    uint id = uint(gl_FragCoord.x) + uint(gl_FragCoord.y) * uint(uWidth);
    uint skip = id * 1000u;
    skipMRG32k3a(skip);
    fragColor = uintToVec4(stepMRG32k3a());
}`