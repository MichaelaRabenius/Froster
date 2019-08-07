#version 330 core

out vec4 finalcolor;
in vec3 interpolatedNormal;
in vec3 lightDirection;
in vec2 st;

void main() {

    vec3 L = normalize(lightDirection);
    vec3 V = vec3(0.0, 0.0, 1.0);
    vec3 N = interpolatedNormal;
    vec3 R = 2.0 * dot(N,L) * N - L;
    float n = 20f;
    vec3 ka = vec3(0.9, 0.4, 0.5);
    vec3 Ia = vec3(0.6, 0.5, 0.8);
    vec3 kd = vec3(0.7, 0.4, 0.0);
    vec3 Id = vec3(0.5, 0.5, 0.0);
    vec3 ks = vec3(1.0, 1.0, 1.0);
    vec3 Is = vec3(1.0, 1.0, 1.0);

    float dotNL = max(dot(N,L), 0.0);
    float dotRV = max(dot(R,V), 0.0);

    if (dotNL == 0.0) dotRV = 0.0;



    vec3 shadedcolor = Ia*ka + Id*kd*dotNL + Is*ks*pow(dotRV, n);
    finalcolor = vec4(shadedcolor, 1.0);

    /*float shading = dot(interpolatedNormal, lightDirection);
    shading = max(0.0, shading); //Clamp negative values to 0.0
    finalcolor = vec4(vec3(shading), 1.0);*/
}
