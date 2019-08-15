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
// FUnctions for transformations
mat3 Translate(vec2 displacement){
    return  mat3(
        vec3(1, 0, 0),
        vec3(0, 1, 0),
        vec3(displacement , 1)
    ); 
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

//Functions for drawing
//NOTE: This function draws a line with height [-len len], meaning if len is 2, the actual length of the line is 4
//Origin/pivot point will be place at one of the ends.
// To reach the end of a drawn line we must therefore translate to double the length.
float Line(vec2 position, float wid, float len){
    //NOTE: It might be that the origin for position may be located in the upper
    //left instead of the lower left? Thats why we must take - in order to move the
    //rectangle upwards?
    position -= vec2(0, len);
    //Comput the distance of the examined point to a line with width and height
    vec2 dist = abs(vec2(position.x, position.y)) - vec2(wid, len);
    return min(max(dist.x,dist.y),0.0) + length(max(dist,0.0));
}

//Function for drawing an lsystem
float lsystem(vec2 position){
    mat3 posR = Rotate(-(20));
    mat3 negR = Rotate(20.);

    //position += vec2(0, -2);

    //Settings for the tree
    float len = 2;
    float wid = 0.0001;

    const int depth = 3;
    const int branches = 2; 
    int maxDepth = int(pow(float(branches) , float(depth )));

    //insert code here for generating the next segments
    //mat3 m1 = Translate(vec2(0,-len/2)); //Matrix to move the segment back to origin

    //Draw the first segment of the tree.
    float trunk =Line(position, wid, len);

    float d = 100.;

    int c = 0; //Will be used to control when to stop drawing

    

    // vec2 p_n = position;

    // //This should move the coordinate system to the top of the first line
    // mat3 mx = posR * Translate(vec2(0, -2*len));// *Translate(vec2(0,-2 * len));

    // p_n = (mx * vec3(p_n,1)).xy;
    // float branch = Line(p_n, wid, len);

    // d = min( d, branch );


    for(int count = 0; count < 10; ++count){
        //Determines if the system should stop drawing.
        int off = int(pow(float(branches), float(depth)));

        //Store the position for drawing the next branches
        vec2 new_position = position;

        //Draw the branches for each depth level
        for(int i = 0; i < depth; ++i){

            //Decreas the branch length at each depth level
            float l = len/pow(2.,float(i));

            //Determine which path to take
            off /= branches; 
            int dec = c / off;
            int path = dec - branches*(dec/branches); //  dec % kBranches

            mat3 mx; //This matrix will be used to draw the new line at the correct position
            if(path == 0){
                //Draw a line connected to the last line, slightly rotated
                mx= posR * Translate(vec2(0,-2*l));
                
            }
            else if(path == 1){
                mx = negR * Translate(vec2(0,-2.*l));
            }
            // else if(path == 2){
            //     mx = negR * Translate(vec2(0,-4.*l));
            // }

            //Move the coordinate system to draw the new line at the correct position
            new_position = (mx * vec3(new_position,1)).xy;

            //Draw the next branch
            float y = Line(new_position, wid, l);


            // Early bail out. Bounding volume is a noodle of radius
            // 2. * l around line segment.
            // if( y-2.0*l > 0.0 ) { 
            //     c += off-1; break;
            // }
            
            //Decide which value to draw for the fragment
            d = min( d, y );
        

        }

        ++c;
        //We do not want to exceed the maximum depth of our tree
        if (c > maxDepth) break;

    }

    
    //Finally output the final value for the fragment.
    return min(d,trunk);
}

void main(){
    vec2 position = (TexCoords*2 - 1);
    position *= 10;


    float d = lsystem(position + vec2(0, 3));

    float t = clamp(d, 0.0, .04) * 2.*12.5;
    vec4 bg = vec4(0);
    vec4 fg = vec4(.8);
    vec4 Color = mix(bg, fg, 1.-t);

    vec4 colorAxis = vec4(0);

    if((position.y < 2 && position.y > -2)){
        colorAxis = vec4(0.,1.0 ,0., 1);
    }

    FragColor = mix(Color, colorAxis, 0.5);
    
}

/*
void main(){
    vec2 position = TexCoords*2 - 1;
    position *= 10;

    float len = 3;
    float wid = 0.02;

    //mat3 trans = Translate(vec2(0, -len/2));
    mat3 rot = Rotate(35);

    position = (rot * vec3(position, 1.)).xy;

    float d = Line(position, wid, len);



    vec4 color = vec4(d,d,d,1.0);

    vec4 colorAxis = vec4(0);

    if((position.y < 0.01 && position.y > -0.01) || (position.x < 0.01 && position.x > -0.01)){
        colorAxis = vec4(0.,1.0 ,0., 1);
    }
    // if(position.y > 0){
    //     colorAxis = vec4(1.,1.0 ,0., 1);
    // }

    FragColor = mix(color, colorAxis, 0.7);
}
*/