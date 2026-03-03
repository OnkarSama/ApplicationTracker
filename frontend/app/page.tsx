"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import Link from "next/link";
import HomepageAnimation from "@/components/ui/Homepage";

export default function Homepage() {
   return(
       <div className="homepage">
           <HomepageAnimation />
       </div>
   );

}