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

float Line(vec2 position, float wid, float len){
    //NOTE: It might be that the origin for position may be located in the upper
    //left instead of the lower left? Thats why we must take - in order to move the
    //rectangle upwards?
    position -= vec2(0, len);
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

mat3 Rotate(float angle){
    float c = cos(angle * PI / 180);
    float s = sin(angle * PI / 180);
    
    return  mat3(
            vec3(c, s, 0),
            vec3(-s, c, 0),
            vec3(0, 0, 1)
    ); 
}

//Function for drawing an lsystem
float lsystem(vec2 position){

    //Settings for the tree
    float len = 3;
    float wid = 0.001;

    int depth = 4;
    const int branches = 5; 
    int maxDepth = int(pow(float(branches) , float(depth )));
    
    //Create 3 branches to form a snowflake
    vec2 pt_1 = position;
    //Draw the first segment of the tree.
    float axiom = Line(pt_1, wid, len);
    float d = 100.;

    int c = 0; //Will be used to control when to stop drawing


    for(int count = 0; count < 1000; ++count){
        mat3 p_Rot = Rotate(-90);
        mat3 n_Rot = Rotate(90);

        //Determines if the system should stop drawing.
        int off = int(pow(float(branches), float(depth)));

        //Store the position for drawing the next branches
        vec2 npt_1 = pt_1;
       
        float l = len;
        //Draw the branches for each depth level
        for(int i = 0; i < depth; ++i){

            //Decreas the branch length at each depth level
            //l = len/pow(2.,float(i));

            //Determine which path to take
            off /= branches; 
            int dec = c / off;
            int path = dec - branches*(dec/branches); //  dec % kBranches

            mat3 mx1; //This matrix will be used to draw the new line at the correct position
            if(path == 0){
                //Draw a smaller line on the base line, rotated negative 90 degrees
                mx1 = n_Rot * Translate(vec2(0,-0.66*2*l));
                 //Shorten the length of each new line as we move further into the system
                l /= 3;
                
            }
            else if(path == 1){
                //Draw a smaller line on the base line, rotated positive 90 degrees
                mx1 = p_Rot * Translate(vec2(0,-0.33*2*l));
                 //Shorten the length of each new line as we move further into the system
                l /= 3;
            }
            else if(path == 2){
                // Draw a smaller line to the right of the base line
                mx1 = Translate(vec2(-0.33*2*l, 0));
                 //Shorten the length of each new line as we move further into the system
                l /= 3;
            }
            else if(path == 3){
                // Draw a smaller line to the left of the base line
                mx1 = Translate(vec2(0.66*2*l, 0));
                 //Shorten the length of each new line as we move further into the system
                l /= 3;
            }
            else if(path == 4){
                // Draw a smaller line further to the right of the base line
                mx1 = Translate(vec2(-2*l, 0));
                l /= 2;
            }

           

            //Move the coordinate system to draw the new line at the correct position
            npt_1 = (mx1 * vec3(npt_1, 1)).xy;
           
            //Draw the next branch
            float y1 = Line(npt_1, wid, l);
        
            // Early bail out. We can stop drawing when we reach the edge of the screen.
            // 2. * l around line segment.
            if( y1 - 2.0 * l > 10.0) { 
                c += off-1; break;
            }
            
            //Decide which value to draw for the fragment
            d = min( d, y1);
        }

        ++c;
        //We do not want to exceed the maximum depth of our tree
        if (c > maxDepth) break;

    }

    
    //Finally output the final value for the fragment.
    return min(d,axiom);
}

void main()
{   
    vec2 position = (TexCoords*2 - 1);
    position *= 10;

    mat3 rot = Rotate(90);
    
    float d1 = lsystem(position + vec2(0, 10));
    float d2 = lsystem((rot * vec3(position,1)).xy + vec2(0, 10));
    float d3 = lsystem((rot * rot * vec3(position,1)).xy + vec2(0, 10));
    float d4 = lsystem((rot * rot * rot * vec3(position,1)).xy + vec2(0, 10));

    float d = min(d1, min(d2,min(d3, d4)));

    // float d1 = lsystem(position);
    // float d = d1;
    
    float t = clamp(d, 0.0, .04) * 2.*12.5;
    vec4 bg = vec4(0.223, 0.411, 0.721, 1.0);
    vec4 fg = vec4(.8);
    vec4 Color = mix(bg, fg, 1.-t);

    FragColor = Color;
    //FragColor = mix(Color, colorAxis, 0.5);
}