#version 330 core
out vec4 FragColor;


in vec2 TexCoords;
in vec3 vTexCoord3D;

uniform vec2 u_resolution;
uniform float u_time;


#define PI 3.14159

#define kDepth 2
#define kBranches 2
#define kMaxDepth 4 // branches ^ depth

//Okay for some reason + is down and left while - is up and right

float Line(vec2 position, float wid, float len){
    //NOTE: It might be that the origin for position may be located in the upper
    //left instead of the lower left? Thats why we must take - in order to move the
    //rectangle upwards?
    //position -= vec2(0, len);
    //Comput the distance of the examined point to a line with width and height
    vec2 dist = abs(vec2(position.x, position.y)) - vec2(wid, len);
    return min(max(dist.x,dist.y),0.0) + length(max(dist,0.0));
}

mat3 Translate(vec2 displacement){
    return  mat3(
        vec3(1, 0, 0),
        vec3(0, 1, 0),
        vec3(displacement , 1)
    ); 
}

void main(){
    vec2 position = TexCoords*2 - 1;
    position *= 10;

    float len = 3;
    float wid = 1;

    mat3 trans = Translate(vec2(0, -8));

    position = (trans * vec3(position, 1.)).xy;

    float d = Line(position, wid, len);



    vec4 color = vec4(d,d,d,1.0);

    vec4 colorAxis = vec4(0);

    if((position.y < 0.01 && position.y > -0.01) || (position.x < 0.01 && position.x > -0.01)){
        colorAxis = vec4(0.,1.0 ,0., 1);
    }
    if(position.y > 0){
        colorAxis = vec4(1.,1.0 ,0., 1);
    }

    FragColor = mix(color, colorAxis, 0.7);
}
