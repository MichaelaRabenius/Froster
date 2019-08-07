#version 410
layout (location = 0) in vec3 in_Position;
layout (location = 1) in vec3 in_Normal;
layout (location = 2) in vec2 in_TexCoords;
//layout (location = 2) in vec2 in_TexCoords;

out vec2 texCoord;
out vec3 interpolatedNormal;
out vec3 lightDirection;

//Plain shader for a quad. Will simply give the quad a single color
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

void main()
{   
    texCoord = in_TexCoords;
    lightDirection = vec3(1.0, 1.0, -1.0);

    vec4 transformedNormal = projection * view * model * vec4(in_Normal, 1.0);
    interpolatedNormal = normalize(vec3(transformedNormal.x, transformedNormal.y, transformedNormal.z));

    gl_Position = projection* view * model * vec4(in_Position, 1.0); 
}  