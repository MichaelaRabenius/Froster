#version 330 core

layout(location = 0) in vec3 Position;
layout(location = 1) in vec3 Normal;
layout(location = 2) in vec2 TexCoord;

out vec3 interpolatedNormal;
out vec3 lightDirection;
uniform mat4 MV, P, C;

void main() {

    lightDirection = mat3(C) * vec3(1.0, 1.0, 1.0);
    gl_Position = P * MV * vec4(Position , 1.0);

    vec3 transformedNormal = mat3(MV) * Normal;
    interpolatedNormal = normalize(transformedNormal);


}

