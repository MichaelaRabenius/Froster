#version 330 core
out vec4 FragColor;


in vec2 TexCoords;
in vec3 vTexCoord3D;

uniform vec2 u_resolution;
uniform float u_time;

//Try doing a julia set
float julia_set(vec2 c, int iter){
    vec2 z;
    z.x = 3.0 * (TexCoords.x - .5);
    z.y = 3.0 * (TexCoords.y - .5);

    int i;
    for (i=0; i<iter; i++) {
            float x = (z.x * z.x - z.y * z.y) + c.x;
        float y = (z.x * z.y + z.x * z.y) + c.y;

        if ((x * x + y * y) > 10.0) break;
        z.x = x;
        z.y = y;
    }

    return float(i) / float(iter);
}


// uniform vec2 c;
// uniform int iter;

void main() {
    vec2 c = vec2(-0.668683, 0.350684);
    int iter = 20;

    float val = julia_set(c, iter);
    
    if(val < 1.0) val = 0.0;

    FragColor = vec4(val, val, val, 1);
}	