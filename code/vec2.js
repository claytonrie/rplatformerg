class Vec2 {
    constructor (x = 0, y = 0, mag = null) {
        this.x = x;
        this.y = y;
        // __MAG__ is the internal tracking of the magnitude of the vactor
        // It doesn't get calculated until Vec2.mag is read or set
        this.__MAG__ = mag;
    }
    
    add (v) {
        return new Vec2(this.x + v.x, this.y + v.y);
    }
    addEq (v) {
        this.x += v.x; this.y += v.y;
        if (this.__MAG__ !== null && Vec2.cross(this, v) === 0) {
            this.__MAG__ += v.mag;
        } else {
            this.__MAG__ = null;
        }
        return this;
    }
    static add(v1, v2) { return new Vec2(v1.x + v2.x, v1.y + v2.y); }
    
    // Scale-Add-Scale: scales v1 by a and v2 by b and adds their sum
    // add(v1, v2) is equal to scAddSc(1, v1,  1, v2)
    //  to(v1, v2) is equal to scAddSc(1, v2, -1, v1)
    static scAddSc(a, v1, b, v2) {
        return new Vec2(a * v1.x + b * v2.x, a * v1.y + b * v2.y);
    }
    
    to (v) { return new Vec2(v.x - this.x, v.y - this.y); }
    static diff(v1, v2) { return new Vec2(v1.x - v2.x, v1.y - v2.y); }
    
    //
    /// Scalar-returning functions
    //
    sqDist () { return this.x * this.x + this.y * this.y; }
    static sqDist (v1, v2 = null) {
        if (v2) {
            return (v1.x - v2.x) * (v1.x - v2.x) + (v1.y - v2.y) * (v1.y - v2.y);
        } else {
            return v1.x * v1.x + v1.y * v1.y;
        }
    }
    
    dot(v) { return this.x * v.x + this.y * v.y; }
    static dot(v1, v2) { return v1.x * v2.x + v1.y * v2.y; }
    
    cross(v) { return this.x * v.y - this.y * v.x; }
    static cross(v1, v2) { return v1.x * v2.y - v1.y * v2.x; }
    // The cross product of v1 and v2 where v3 is taken as the origin
    static crossRel(v1, v2, v3) { return (v1.x - v3.x) * (v2.y - v3.y) - (v1.y - v3.y) * (v2.x - v3.x); }
    
    //
    /// Vector-returning functions
    //
    scale(sc) {
        return new Vec2(sc * this.x, sc * this.y, 
            (this.__MAG__ ? sc * this.__MAG__ : null));
    }
    scaleEq(sc) {
        this.x *= sc;
        this.y *= sc;
        if (this.__MAG__ !== null) {
            this.__MAG__ *= sc;
        }
        return this;
    }
    static mult(sc, v) {
        return new Vec2(sc * v.x, sc * v.y, 
            (v.__MAG__ ? sc * v.__MAG__ : null));
    }
    
    normalize(len = 1) {
        let rtV2 = new Vec2(this.x, this.y, this.__MAG__);
        rtV2.mag = len;
        return rtV2;
    }
    normEq(len = 1) {
        this.mag = len;
        return this;
    }
    static normalize(v, len = 1) {
        let rtV2 = new Vec2(v.x, v.y, v.__MAG__);
        rtV2.mag = len;
        return rtV2;
    }
    
    perp(sc = 1) {
        return new Vec2(-sc * this.y, sc * this.x, this.__MAG__ ? Math.abs(sc) * this.__MAG__ : null);
    }
    static perp(v, sc = 1) {
        return new Vec2(-sc * v.y, sc * v.x, v.__MAG__ ? Math.abs(sc) * this.__MAG__ : null);
    }
    
    //
    /// Complex functions
    //
    cplxArg() {
        return Math.atan2(this.y, this.x);
    }
    static cplxArg(v) {
        return Math.atan2(v.y, v.x);
    }
    
    cplxInv() {
        let sc = this.sqDist();
        return new Vec2(this.x / sc, -this.y / sc, 
            this.__MAG__ ? 1 / this.__MAG__ : null);
    }
    static cplxInv(v) {
        let sc = v.sqDist();
        return new Vec2(v.x / sc, -v.y / sc, v.__MAG__ ? 1 / v.__MAG__ : null);
    }
    
    cplxMult(v) {
        return new Vec2(this.x * v.x - this.y * v.y, 
            this.x * v.y + this.y * v.x, 
            (this.__MAG__ && v.__MAG__) ? (this.__MAG__ * v.__MAG__) : null);
    }
    static cplxMult(v1, v2) {
        return new Vec2(v1.x * v2.x - v1.y * v2.y, 
            v1.x * v2.y + v1.y * v2.x, 
            (v1.__MAG__ && v2.__MAG__) ? (v1.__MAG__ * v2.__MAG__) : null);
    }
    
    cplxLog(b = null) {
        let RE;
        if (this.__MAG__) {
            if (b) {
                RE = Math.log(this.mag) / Math.log(b);
            } else {
                RE = Math.log(this.mag);
            }
        } else {
            if (b) {
                RE = Math.log(this.sqDist()) / 2 / Math.log(b);
            } else {
                RE = Math.log(this.sqDist()) / 2;
            }
        }
        return new Vec2(RE, this.cplxArg());
    }
    static cplxLog(v, b = null) {
        let RE;
        if (v.__MAG__) {
            if (b) {
                RE = Math.log(v.mag) / Math.log(b);
            } else {
                RE = Math.log(v.mag);
            }
        } else {
            if (b) {
                RE = Math.log(v.sqDist()) / 2 / Math.log(b);
            } else {
                RE = Math.log(v.sqDist()) / 2;
            }
        }
        return new Vec2(RE, Vector2.cplxArg(v));
    }
    
    cplxPow(c) {
        if (Number.isFinite(c)) {
            let MOD = this.mag ** c, 
                ARG = this.cplxArg() * c;
            return new Vec2(MOD * Math.cos(ARG), MOD * Math.sin(ARG), MOD);
        }
        let LN, ANG = this.cplxArg();
        if (this.__MAG__) {
            if (this.mag === 0) {
                return new Vec2();
            } else {
                LN = Math.log(this.mag);
            }
        } else {
            let s = this.sqDist()
            if (s === 0) {
                return new Vec2();
            } else {
                LN = Math.log(s) / 2;
            }
        }
        let RE = Math.exp(LN * c.x - ANG * c.y), IM = LN * c.y + ANG * c.x;
        return new Vec2(RE * Math.cos(IM), RE * Math.sin(IM), RE);
    }
    static cplxPow(b, e) {
        if (Number.isFinite(e)) {
            let MOD = b.mag ** e, 
                ARG = b.cplxArg() * e;
            return new Vec2(MOD * Math.cos(ARG), MOD * Math.sin(ARG));
        }
        let LN, ANG = b.cplxArg();
        if (b.__MAG__) {
            if (b.mag === 0) {
                return new Vec2();
            } else {
                LN = Math.log(b.mag);
            }
        } else {
            let s = b.sqDist()
            if (s === 0) {
                return new Vec2();
            } else {
                LN = b.log(s) / 2;
            }
        }
        let RE = Math.exp(LN * e.x - ANG * e.y), IM = LN * e.y + ANG * e.x;
        return new Vec2(RE * Math.cos(IM), RE * Math.sin(IM), RE);
    } 
    cplxExp() {
        let RE = Math.exp(this.x);
        return new Vec2(RE * Math.cos(this.y), RE * Math.sin(this.y), RE);
    }
    static cplxExp(c) {
        let RE = Math.exp(c.x);
        return new Vec2(RE * Math.cos(c.y), RE * Math.sin(c.y), RE);
    }
    
    get mag() {
        if (this.__MAG__ === null) {
            this.__MAG__ = this.x * this.x + this.y * this.y;
            this.__MAG__ **= 0.5; 
        }
        return this.__MAG__;
    }
    set mag(val) {
        if (this.__MAG__ === null) {
            this.__MAG__ = this.x * this.x + this.y * this.y;
            this.__MAG__ **= 0.5; 
        }
        let mult = val / this.__MAG__;
        this.x *= mult;
        this.y *= mult;
        this.__MAG__ = val;
        return val;
    }
    
    toString() {
        return `Vec2{${this.x}, ${this.y}}`;
    }
}
