#version 330 core
layout (location = 0) in vec3 in_Position;
layout (location = 1) in vec3 in_Normal;
layout (location = 2) in vec2 in_TexCoords;

uniform float time;

out vec3 vTexCoord3D;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

//This works because we generate 3D texture coordinates which will update when we move the ball
// I.e. it works because we calculate the texture coordinates based on the vertex positions.

void main(void) {
	vTexCoord3D = in_Position * 4.0 - vec3(0.0, 0.0, time);
	gl_Position = projection * view * model * vec4(in_Position, 1.0);
}
