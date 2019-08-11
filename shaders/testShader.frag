#version 330 core
out vec4 FragColor;


in vec2 TexCoords;
in vec3 vTexCoord3D;

#define PI 3.14159265359

uniform vec2 u_resolution;
uniform float u_time;


void main(){
    vec2 st = TexCoords;
    st.xy -= vec2(0.5); // Set texture coordinates to [-0.5, 0.5]
    vec3 color = vec3(0.0);

    float angle = atan(st.y, st.x);
    float radius = sqrt(st.x*st.x + st.y*st.y);
    float radialIntensity = pow(sin(radius * 32.0) * 0.5 + 0.5, 2.0);
    float angleIntensity = pow(sin(angle * 32.0) * 0.5 + 0.5, 2.0);
    float intensity = radialIntensity * angleIntensity;

    color = vec3(intensity);

    FragColor = vec4(color, 1.0);
}
