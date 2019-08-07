#version 410
layout (location = 0) in vec2 aPos;
layout (location = 1) in vec2 aTexCoords;

//Plain shader for a quad. Will simply give the quad a single color

void main()
{
    gl_Position = vec4(aPos.x, aPos.y, 0.0, 1.0); 
}  