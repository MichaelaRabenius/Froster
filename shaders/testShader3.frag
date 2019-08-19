#version 330 core
out vec4 FragColor;


in vec2 TexCoords;
in vec3 vTexCoord3D;

uniform vec2 u_resolution;
uniform float u_time;

#define PI 3.14159

float rand(float x)
{
    return fract(sin(dot(vec2(x+47.49,38.2467/(x+2.3)), vec2(12.9898, 78.233)))* (43758.5453));
}

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}


mat3 Rotate(float angle){
    float c = cos(angle * PI / 180);
    float s = sin(angle * PI / 180);
    
    return  mat3(
            vec3(c, s, 0),
            vec3(-s, c, 0),
            vec3(0, 0, 1)
    ); 
}

mat3 Translate(vec2 displacement){
    return  mat3(
        vec3(1, 0, 0),
        vec3(0, 1, 0),
        vec3(displacement , 1)
    ); 
}



float line(vec2 p, float len) {
    float thickness = 1.0/100.0;
    vec2 a = vec2(0, len); // start
    vec2 b = vec2(0,0);
    mat3 r = Rotate (20);

    vec2 pa = p - a;
    vec2 ba = b - a;

    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    float idk = length(pa - ba*h);

    return smoothstep(0.0, thickness, idk);

    
}

float system(vec2 st){
    float len = 0.5;

    float base_line = line(st, len);

    float small_line = 100;

    vec2 new_st = st;
    float l = len;

    int flip = 1;
    for(int i = 0; i < 3; ++i){
        l = len*0.2;

        float r = rand(i); //Generate a random number to calculate the position and rotation
    
        mat3 rot;

        if(flip == 1){
            flip = 0;
            rot = Rotate(-45 * r);
        } else {
            flip = 1;
            rot = Rotate(45 * r);
        }

        mat3 trans = Translate(vec2(0, -2*l));

        new_st = ( rot * trans *  vec3(new_st, 1) ).xy;

        float temp_line = line(new_st, l);
        
        small_line = min(small_line, temp_line);

        new_st = st;
    }
    return min(base_line, small_line);
}

void main(){
    vec2 st = TexCoords*2 - 1;
    float len = 0.5;

    float c = system(st);

    vec3 color = vec3(c,c,c);
    FragColor = vec4(color, 1);
}