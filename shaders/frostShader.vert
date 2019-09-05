#version 330 core

//For spheres
// layout (location = 0) in vec3 in_Position;
// layout (location = 1) in vec3 in_Normal;
// layout (location = 2) in vec2 in_TexCoords;

//For screen quad
layout (location = 0) in vec3 in_Position;
layout (location = 1) in vec2 in_TexCoords;

out vec2 TexCoords;
out vec3 vTexCoord3D;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{   
    vTexCoord3D = in_Position;
    TexCoords = in_TexCoords;
    gl_Position = projection* view * model * vec4(in_Position, 1.0); 
}  