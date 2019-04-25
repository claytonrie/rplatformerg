
class Menu {
    constructor (name, priority = true, changeActivity = true) {
        this.id = name;
        this.index = 0;
        this.length = 0;

        this.txtWidth = 100;
        this.txtSize = 10;
        this.txtColor = "#000";
        this.txtSelect = "#FFF";
        this.txtFont = "sans-serif";
        this.txtDist = 20;

        this.bgOp     = 0.9;
        this.bgColor  = "#FDD";
        this.bdrColor = "#400";

        this.sltColor = "#C00"
        this.sltPos   = 0;
        this.sltTrans = false;

        this.pos = new Vec2();
        this.pad = new Vec2();
        this.turn = Math.floor(2 * this.txtSize * Math.random()) - this.txtSize;
        this.turnList = [];

        this.text = [];
        this.func = [];
        this.activity = 1 - +priority;

        if (priority && changeActivity) {
            let i = Menu.list.length - 1;
            if (i < 0) {
                for (; i >= 0; i -= 1) {
                    Menu.list[i].activity += 1;
                }
            }
            Menu.active = true;
            Menu.top = Menu.list.length;
        }
        this.listId = Menu.list.length;
        Menu.list.push(this);
        Menu.isOrdered = false;
        return this;
    }
    addItem(text, func) {
        this.length += 1;
        this.text.push(text);
        this.func.push(func);
        this.turnList.push(Math.floor(2 * this.txtSize * Math.random()) - this.txtSize);
        return this;
    }
    setPos(x, y) {
        this.pos.x = x;
        this.pos.y = y;
        return this;
    }
    setPad(x, y) {
        this.pad.x = x;
        this.pad.y = y;
        return this;
    }
    setColor(txt, txtSelect, bg, bgSelect, bdr) {
        this.txtColor = txt;
        this.txtSelect = txtSelect;
        this.bgColor = bg;
        this.sltColor = bgSelect;
        this.bdrColor = bdr;
        return this;
    }
    setText(size, font, width = 100, dist = 2 * size, clr = "#000", slt = "#FFF") {
        this.turn = Math.floor(2 * size * Math.random()) - size;

        this.txtWidth = width;
        this.txtSize = size;
        this.txtColor = clr;
        this.txtSelect = slt;
        this.txtFont = font;
        this.txtDist = dist;

        return this;
    }
    runOnSelf(func) {
        func(this);
        return this;
    }

    move(amt) {
        if (Menu.active) {
            if (this.length <= 1) {
                this.index = 0;
            } else {
                this.index += amt;
                while (this.index < 0) {
                    this.index += this.length;
                }
                this.index %= this.length;
                this.sltTrans = true;
            }
        }
    }
    select() {
        this.func[this.index](this);
    }
    close(closeAll = false) {
        if (closeAll) {
            Menu.active = false;
            Menu.top = 0;
            Menu.list = [];
            Menu.min = Infinity;
        } else {
            Menu.isOrdered = false;
            Menu.list.splice(this.listId, 1);
            let i = Menu.list.length - 1;
            if (i < 0) {
                Menu.active = false;
            } else if (this.listId === Menu.top) {
                Menu.minAct = Infinity;
                for (; i >= 0; i -= 1) {
                    if (i >= this.listId) {
                        Menu.list[i].listId = i;
                    }
                    if (Menu.list[i].activity > this.activity) {
                        Menu.list[i].activity -= 1;
                    }
                    if (Menu.list[i].activity < Menu.minAct) {
                        Menu.minAct = Menu.list[i].activity;
                        Menu.top = i;
                    }
                }
            } else {
                for (; i >= 0; i -= 1) {
                    if (i >= this.listId) {
                        Menu.list[i].listId = i;
                    }
                    if (Menu.list[i].activity > this.activity) {
                        Menu.list[i].activity -= 1;
                    }
                }
            }
        }
    }
    animate(percent) {
        if (this.sltTrans) {
            let diff = this.index - this.sltPos;
            if (Math.abs(diff) > Math.abs(diff + this.length)) {
                diff += this.length;
            } else if (Math.abs(diff) > Math.abs(diff - this.length)) {
                diff -= this.length;
            }
            if (diff > 0) {
                if (Math.ceil(diff) * percent > diff) {
                    this.sltPos = this.index;
                    this.sltTrans = false;
                } else {
                    this.sltPos += Math.ceil(diff) * percent;
                }
            } else {
                if (Math.floor(diff) * percent < diff) {
                    this.sltPos = this.index;
                    this.sltTrans = false;
                } else {
                    this.sltPos += Math.floor(diff) * percent;
                }
            }
            while (this.sltPos < 0) {
                this.sltPos += this.length;
            }
            this.sltPos %= this.length;
        }
    }

    static animate(percent) {
        if (Menu.active) {
            Menu.list[Menu.top].animate(percent);
        }
    }
    static close(closeAll = true) {
        if (closeAll) {
            Menu.active = false;
            Menu.top = 0;
            Menu.list = [];
            Menu.min = Infinity;
        } else {
            Menu.list[Menu.top].close(false);
        }
    }
    static pause() {
        Menu.active = false;
    }
    static order() {
        Menu.list.sort((a, b) => a.activity - b.activity);   
        Menu.isOrdered = true;
    }
    static draw() {
        if (Menu.active) {
            if (!Menu.isOrdered) {
                Menu.order();
            }
            let i = 0, l = Menu.list.length;
            for (; i < l; i += 1) {
                let mn = Menu.list[i];
                let opMult = i === Menu.top ? 1 : 0.5;

                // Variables for the rotation-skew of the menu boxes
                let width, height, posx, posy, padx, pady;
                width  = mn.txtWidth + mn.txtDist;
                height = mn.length * mn.txtDist;
                   posx = mn.pos.x; posy = mn.pos.y;
                padx = (2 * mn.pad.x  + mn.pad.y) / 3;
                pady = (2 * mn.pad.y  + mn.pad.x) / 3;
                if (mn.turn > 0) {
                    padx += mn.turn;
                } else {
                    pady -= mn.turn;
                }

                // Fill in the background of the menu
                ctx.globalAlpha = mn.bgOp * opMult;
                var lnGrade = ctx.createLinearGradient(
                    posx + width / 2, posy,
                    posx + width / 2, posy + height);
                lnGrade.addColorStop(0, `rgba(255, 255, 255, 0.5)`);
                lnGrade.addColorStop(1, mn.bgColor);
                ctx.fillStyle = lnGrade;

                ctx.beginPath();
                ctx.moveTo(posx - padx, posy - pady);
                ctx.lineTo(posx + width + pady, posy - padx);
                ctx.lineTo(posx + width + padx, posy + height + pady);
                ctx.lineTo(posx - pady, posy + height + padx);
                ctx.closePath();
                ctx.fill();

                // Draw in menu border
                ctx.globalAlpha = 1.0;
                ctx.strokeStyle = mn.bdrColor;
                ctx.stroke();
                ctx.globalAlpha = opMult;

                // Calculate the selection region for the item selection clipping box
                let clipper = new Path2D(), anticlip = new Path2D();
                let multi = mn.sltPos % 1;
                padx = (2 * mn.pad.x  + mn.pad.y) / 3;
                pady = (2 * mn.pad.y  + mn.pad.x) / 3;
                let turnVar = mn.turnList[Math.floor(mn.sltPos)];
                if (mn.sltPos % 1 !== 0) {
                    if (mn.sltPos > mn.length - 1) {
                        turnVar *= 1 - multi;
                        turnVar += multi * mn.turnList[0];
                    } else {
                        turnVar *= 1 - multi;
                        turnVar += multi * mn.turnList[Math.floor(mn.sltPos) + 1];
                    }
                }
                if (turnVar > 0) {
                    padx += turnVar;
                } else {
                    pady -= turnVar;
                }
                // Check to see if the selection box is split
                if (mn.sltPos > mn.length - 1) {
                    // Create the bottom box region
                    let bPosy = posy +  mn.sltPos * mn.txtDist,
                        bPadx = (1 - multi) * padx, bPady = (1 - multi) * pady;
                    height = Math.round(mn.txtDist * (1 - multi));
                    width = mn.txtWidth + (mn.txtDist - mn.txtSize);
                    clipper.moveTo(posx - bPadx, bPosy - bPady);
                    clipper.lineTo(posx + width + bPady, bPosy - bPadx);
                    clipper.lineTo(posx + width + bPadx, bPosy + height + bPady);
                    clipper.lineTo(posx - bPady, bPosy + height + bPadx);
                    clipper.closePath();

                    // Create the top box region
                    height = Math.round(mn.txtDist * multi);
                    bPadx = multi * padx;
                    bPady = multi * pady;
                    clipper.moveTo(posx - bPadx, posy - bPady);
                    clipper.lineTo(posx + width + bPady, posy - bPadx);
                    clipper.lineTo(posx + width + bPadx, posy + height + bPady);
                    clipper.lineTo(posx - bPady, posy + height + bPadx);
                    clipper.closePath();
                } else {
                    // Create the selection box region
                    let bPosy = posy +  mn.sltPos * mn.txtDist;
                    height = mn.txtDist;
                    width = mn.txtWidth + (mn.txtDist - mn.txtSize);
                    clipper.moveTo(posx - padx, bPosy - pady);
                    clipper.lineTo(posx + width + pady, bPosy - padx);
                    clipper.lineTo(posx + width + padx, bPosy + height + pady);
                    clipper.lineTo(posx - pady, bPosy + height + padx);
                    clipper.closePath();
                }
                anticlip.addPath(clipper);
                anticlip.rect(0, 0, CVW, CVH);

                // Fill in the selection box
                ctx.save();
                ctx.fillStyle = mn.sltColor;
                ctx.clip(clipper);
                ctx.fillRect(0, 0, CVW, CVH);
                ctx.restore();

                // Draw the text
                ctx.font = `${mn.txtSize}px ${mn.txtFont}`;
                ctx.textAlign = "start"; ctx.textBaseline = "middle";
                ctx.fillStyle = mn.txtColor;
                let j = mn.length - 1;
                for (; j >= 0; j -= 1) {
                    let dist = Math.abs(j - mn.sltPos);
                    if (dist > mn.length / 2) {
                        dist = mn.length - dist;
                    }
                    ctx.save();
                    ctx.clip(anticlip, "evenodd");
                    ctx.fillText(mn.text[j],
                        mn.pad.x + posx + (mn.txtDist - mn.txtSize) / 2,
                        mn.pad.y + posy + (j + 0.5) * mn.txtDist,
                        mn.txtWidth);
                    ctx.restore();
                    if (dist < 2) {
                        ctx.save();
                        ctx.fillStyle = mn.txtSelect;
                        ctx.clip(clipper);
                        ctx.fillText(mn.text[j],
                            mn.pad.x + posx + (mn.txtDist - mn.txtSize) / 2,
                            mn.pad.y + posy + (j + 0.5) * mn.txtDist,
                            mn.txtWidth);
                        ctx.restore();
                    }
                }
            }
        }
    }
}
Menu.active = false;
Menu.isOrdered = false;
Menu.list = [];
Menu.top = 0; Menu.minAct = Infinity;
