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

float rand(float x)
{
    return fract(sin(dot(vec2(x+47.49,38.2467/(x+2.3)), vec2(12.9898, 78.233)))* (43758.5453));
}

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

/*************** Functions for drawing ****************/
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

// Primitive shape .
float primitive(vec2 pt, float wid, float len)
{
    mat3 posRot = Rotate(-(22.5));
    mat3 negRot = Rotate((30));
    
    float t1 = Line(pt, wid, len); //Base line

    vec2 pt_t2 = (posRot * Translate(vec2(0,-1.3 * len)) * vec3(pt,1)).xy;
    float t2 = Line(pt_t2, wid, len/4.);

    vec2 pt_t3 = (negRot * Translate(vec2(0,-0.4 * len)) * vec3(pt,1)).xy;
    float t3 = Line(pt_t3, wid, len/4.);

    return min(t1, min(t2, t3));
}

// Primitive shape .
float primitive2(vec2 pt, float wid, float len)
{
    mat3 posRot = Rotate(-(45.));
    mat3 negRot = Rotate((45));
    
    float t1 = Line(pt, wid, len); //Base line

    float trans = len * 2 / 5;

    for(int i = 0; i < 5; ++i){
        
        vec2 n_pt2 = pt;
        vec2 n_pt3 = pt;

        // float r1 = rand(n_pt2);
        // float r2 = rand(n_pt3);


        float l = len/pow(2.,float(i)) / 2;

        mat3 mx1 = posRot * Translate( vec2(0, -trans*i));
        mat3 mx2 = negRot * Translate( vec2(0, -trans*i));
        
        //Move the coordinate system to draw the new line at the correct position
        n_pt2 = (mx1 * vec3(n_pt2, 1)).xy;
        //Draw the next branch
        float t2 = Line(n_pt2, wid, l);

        n_pt3 = (mx2 * vec3(n_pt3, 1)).xy;
        //Draw the next branch
        float t3 = Line(n_pt3, wid, l);

        //Decide which value to draw for the fragment
        t1 = min( t1, min(t2, t3) );
    }

    return t1;
}

// Primitive shape .
float primitive3(vec2 pt, float wid, float len)
{
    mat3 posRot = Rotate(-(40.));
    mat3 negRot = Rotate((45));
    
    float t1 = Line(pt, wid, len); //Base line

    vec2 pt2 = (negRot  * Translate(vec2(0, -2*0.33*len)) * vec3(pt,1)).xy;
    vec2 pt3 = (negRot * Translate(vec2(0, -2*0.66*len)) * vec3(pt,1)).xy;

    float t2 = Line(pt2, wid, len/2); //Base line
    float t3 = Line(pt3, wid, len/2);


    return min(t1, min(t2, t3));
}

//Function for drawing an lsystem
float lsystem(vec2 position){
    mat3 posR = Rotate(-(15));
    mat3 negR = Rotate(15);

    mat3 baseRot1 = Rotate(-120);
    mat3 baseRot2 = Rotate(120);

    //position += vec2(0, -2);

    //Settings for the tree
    float len = 2;
    float wid = 0.0001;

    const int depth = 5;
    const int branches = 3; 
    int maxDepth = int(pow(float(branches) , float(depth )));

    //insert code here for generating the next segments
    //mat3 m1 = Translate(vec2(0,-len/2)); //Matrix to move the segment back to origin

    //Draw the first segment of the tree.
    //float axiom = Line(position, wid, len);
    vec2 position2 = (baseRot1 * vec3(position, 1)).xy;
    vec2 position3 = (baseRot2 * vec3(position, 1)).xy;

    float line1 = primitive2(position, wid, len);
    float line2 = primitive2(position2, wid, len);
    float line3 = primitive2(position3, wid, len);
    float axiom = min(line1, min(line2, line3));

    float d = 100.;

    int c = 0; //Will be used to control when to stop drawing


    for(int count = 0; count < 1000; ++count){
        //Determines if the system should stop drawing.
        int off = int(pow(float(branches), float(depth)));

        //Store the position for drawing the next branches
        vec2 new_position = position;
        vec2 new_position2 = position2;
        vec2 new_position3 = position3;

        float l = len;
        //Draw the branches for each depth level
        for(int i = 0; i < depth; ++i){

            //Decreas the branch length at each depth level
            //float l = len * 0.8; //len/pow(2.,float(i));

            //Determine which path to take
            off /= branches; 
            int dec = c / off;
            int path = dec - branches*(dec/branches); //  dec % kBranches

            mat3 mx1, mx2, mx3; //This matrix will be used to draw the new line at the correct position
            if(path == 0){
                //Draw a line connected to the last line, slightly rotated
                mx1= posR * Translate(vec2(0,-2*l));
                mx2 = posR *  Translate(vec2(0,-2*l));
                mx3 = posR *  Translate(vec2(0,-2*l));
                // mx3= posR * baseRot2 * Translate(vec2(0,-2*l));
                
            }
            else if(path == 1){
                l = l/pow(2.,float(i));
                mat3 wind = Rotate(.6*sin(2.));
                mx1 = wind * posR * Translate(vec2(0,-0.7*l));
                mx2 = wind * posR * Translate(vec2(0,-0.7*l));
                mx3 = wind * posR * Translate(vec2(0,-0.7*l));
            }
            else if(path == 2){
                l = l/pow(2.,float(i));
                mat3 wind = Rotate(-.6*sin(2.));
                mx1 = wind * negR * Translate(vec2(0,-2.*l));
                mx2 = wind * negR * Translate(vec2(0,-2.*l));
                mx3 = wind * negR * Translate(vec2(0,-2.*l));
            }


            //Move the coordinate system to draw the new line at the correct position
            new_position = (mx1 * vec3(new_position, 1)).xy;
            new_position2 = (mx2 * vec3(new_position2, 1)).xy;
            new_position3 = (mx3 * vec3(new_position3, 1)).xy;

            //Draw the next branch
            float y = primitive2(new_position, wid, l);
            float y2 = primitive2(new_position2, wid, l);
            float y3 = primitive2(new_position3, wid, l);


            // Early bail out. We can stop drawing when we reach the edge of the screen.
            // 2. * l around line segment.
            if( y - 2.0 * l > 5.0 || y2 - 2.0 * l > 5.0 ||  y3 - 2.0 * l > 5.0 ) { 
                c += off-1; break;
            }
            
            //Decide which value to draw for the fragment
            d = min( d, min(y, min(y2,y3) ));
        
            //l *= 0.9;
        }

        ++c;
        //We do not want to exceed the maximum depth of our tree
        if (c > maxDepth) break;

    }

    
    //Finally output the final value for the fragment.
    return min(d,axiom);
}

//Function for drawing an lsystem
float lsystem2(vec2 position){
    mat3 posR = Rotate(-(45));
    mat3 negR = Rotate(45);
    
    mat3 posBaseRot = Rotate(-120);
    mat3 negBaseRot = Rotate(120);

    //Settings for the tree
    float len = 1;
    float wid = 0.0001;

    const int depth = 2;
    const int branches = 7; 
    int maxDepth = int(pow(float(branches) , float(depth )));
    
    //Create 3 branches to form a snowflake
    vec2 pt_1 = position;
    vec2 pt_2 = (posBaseRot * vec3(position,1)).xy;
    vec2 pt_3 = (negBaseRot * vec3(position,1)).xy;

    //Draw the first segment of the tree.
    float line1 = Line(pt_1, wid, len);
    float line2 = Line(pt_2, wid, len);
    float line3 = Line(pt_3, wid, len);

    float axiom = min(line1, min(line2, line3));
    
    float d = 100.;

    int c = 0; //Will be used to control when to stop drawing


    for(int count = 0; count < 1000; ++count){
        //Determines if the system should stop drawing.
        int off = int(pow(float(branches), float(depth)));

        //Store the position for drawing the next branches
        vec2 npt_1 = pt_1;
        vec2 npt_2 = pt_2;
        vec2 npt_3 = pt_3;
       
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
                //Draw a line connected to the last line, slightly rotated
                mx1 =  posR * Translate(vec2(0,-0.8*2*l));
                               // mx3= posR * baseRot2 * Translate(vec2(0,-2*l));
                
            }
            else if(path == 1){
                mx1 = negR * Translate(vec2(0,-0.8*2*l));
            }
            else if(path == 2){

                mx1 = posR * Translate(vec2(0,-0.5*2*l));
            }
            else if(path == 3){

                mx1 = negR * Translate(vec2(0,-0.5*2*l));
            }
            else if(path == 4){
                mx1 = posR * Translate(vec2(0,-0.2*2*l));
                
            }
            else if(path == 5){
                mx1 = negR * Translate(vec2(0,-0.2*2*l));
                
            }
            else if(path == 6){
                mx1 = Translate(vec2(0,-2*l));
                
            }

            //Shorten the length of each new line as we move further into the system
            l /= 3;

            //Move the coordinate system to draw the new line at the correct position
            npt_1 = (mx1 * vec3(npt_1, 1)).xy;
            npt_2 = (mx1 * vec3(npt_2, 1)).xy;
            npt_3 = (mx1 * vec3(npt_3, 1)).xy;
            
            //Draw the next branch
            float y1 = Line(npt_1, wid, l);
            float y2 = Line(npt_2, wid, l);
            float y3 = Line(npt_3, wid, l);
            
            // Early bail out. We can stop drawing when we reach the edge of the screen.
            // 2. * l around line segment.
            if( y1 - 2.0 * l > 6.0 || y2 - 2.0 * l > 6.0 || y3 - 2.0 * l > 6.0 ) { 
                c += off-1; break;
            }
            
            //Decide which value to draw for the fragment
            d = min( d, min(y1, min(y2, y3)));
        }

        ++c;
        //We do not want to exceed the maximum depth of our tree
        if (c > maxDepth) break;

    }

    
    //Finally output the final value for the fragment.
    return min(d,axiom);
}

//Function for drawing an lsystem
float lsystem3(vec2 position){
    mat3 posR = Rotate(-(45));
    mat3 negR = Rotate(45);
    
    mat3 posBaseRot = Rotate(-120);
    mat3 negBaseRot = Rotate(120);

    //Settings for the tree
    float len = 1;
    float wid = 0.0001;

    const int depth = 2;
    const int branches = 7; 
    int maxDepth = int(pow(float(branches) , float(depth )));
    
    //Create 3 branches to form a snowflake
    vec2 pt_1 = position;
    //Draw the first segment of the tree.
    float axiom = Line(pt_1, wid, len);
    float d = 100.;

    int c = 0; //Will be used to control when to stop drawing


    for(int count = 0; count < 1000; ++count){
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
                //Draw a line connected to the last line, slightly rotated
                mx1 =  posR * Translate(vec2(0,-0.8*2*l));
                
            }
            else if(path == 1){
                mx1 = negR * Translate(vec2(0,-0.8*2*l));
            }
            else if(path == 2){

                mx1 = posR * Translate(vec2(0,-0.5*2*l));
            }
            else if(path == 3){

                mx1 = negR * Translate(vec2(0,-0.5*2*l));
            }
            else if(path == 4){
                mx1 = posR * Translate(vec2(0,-0.2*2*l));
                
            }
            else if(path == 5){
                mx1 = negR * Translate(vec2(0,-0.2*2*l));
                
            }
            else if(path == 6){
                mx1 = Translate(vec2(0,-2*l));
                
            }

            //Shorten the length of each new line as we move further into the system
            l /= 3;

            //Move the coordinate system to draw the new line at the correct position
            npt_1 = (mx1 * vec3(npt_1, 1)).xy;
           
            //Draw the next branch
            float y1 = Line(npt_1, wid, l);
        
            // Early bail out. We can stop drawing when we reach the edge of the screen.
            // 2. * l around line segment.
            if( y1 - 2.0 * l > 6.0) { 
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


float system(vec2 position){
    mat3 posR = Rotate(-(90));
    mat3 negR = Rotate(15);

    //position += vec2(0, -2);

    //Settings for the tree
    float len = 2;
    float wid = 0.0001;

    float move_len = len + u_time/2;

    float axiom = primitive2(position, wid, move_len);

    float d = 100.;

    vec2 new_position = position;

    // int branch = 1;

    // while(branch < 10){
    //     vec2 new_position = position;

    //     float l = len/pow(2.,float(branch));

    //     mat3 mx = posR * Translate(vec2(0, -0.1 * branch * len + vec2(0, 0.1*branch)));

    //     //Move the coordinate system to draw the new line at the correct position
    //     new_position = (mx * vec3(new_position, 1)).xy;

    //     //Draw the next branch
    //     float y = Line(new_position, wid, move_len);

    //     //Decide which value to draw for the fragment
    //     d = min( d, y );

    //     ++branch;
    // }


    for(int c = 0; c < 5; ++c){
        
        vec2 new_position = position;

        float l = len/pow(2.,float(c));

       
        mat3 mx = posR * Translate(vec2(0,-0.5*c*len + vec2(0, 0.1*c)));

        //Move the coordinate system to draw the new line at the correct position
        new_position = (mx * vec3(new_position, 1)).xy;

        //Draw the next branch
        float y = primitive2(new_position, wid, move_len);

        //Decide which value to draw for the fragment
        d = min( d, y );
    }

    

    return min(d, axiom);

}

void main(){
    vec2 position = (TexCoords*2 - 1);
    position *= 10;


    //float d = lsystem(position);
    //float d = lsystem2(position);
    //float d = lsystem3(position);
    //float d = system(position);

    //float d = primitive2(position, 0.01, 4);
    //float d = primitive3(position, 0.01, 4);

    float d = lsystem3(position);
    mat3 rot = Rotate(-60);
    vec2 p = position;
    for(int i = 0; i < 5; ++i){
        p = (rot * vec3(p,1)).xy;
        float d_temp = lsystem3(p);
        d = min(d, d_temp);
        
    }

    float t = clamp(d, 0.0, .04) * 2.*12.5;
    vec4 bg = vec4(0.223, 0.411, 0.721, 1.0);
    vec4 fg = vec4(.8);
    vec4 Color = mix(bg, fg, 1.-t);

    // vec4 colorAxis = vec4(0);

    // if((position.y < 2 && position.y > -2)){
    //     colorAxis = vec4(0.,1.0 ,0., 1);
    // }

    FragColor = Color;
    //FragColor = mix(Color, colorAxis, 0.5);
    
}