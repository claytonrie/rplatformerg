class Menu {
    //// lType (list types):
    //  0 => Single list
    //  1 => 2D array
    //  2 => Custom links
    //// bType (border types):
    //  0 => Skew rectangle border
    //  1 => Skew parallelogram border
    //  2 => No border
    //  3 => No backdrop
    constructor (name, priority = true, changeActivity = true,
                 startupFunc = null) {
        this.id = name;  // \
        this.lType = 0;  // | Universal Menu properties
        this.bType = 1;  // |
        this.index = 0;  // |
        this.length = 0; // /
        this.startup = startupFunc !== null;
        this.lock = this.startup;
        this.startFunc = startupFunc;
        this.op = 1;

        // Text properties
        this.txtXOffset = 2.5; // lType = 0, 1
        this.txtWidth = 100;
        this.txtSize = 10;
        this.txtColor = "#000";
        this.txtSelect = "#FFF";
        this.txtFont = "sans-serif";
        this.txtDist = 20; // lType = 0, 1

        this.bgOp     = 0.9; // bType = 0 -- 2
        this.bgColor  = "#FDD"; // bType = 0 -- 2
        this.bdrColor = "#400"; // bType = 0, 1

        this.sltColor = "#C00"
        this.sltPos   = 0;
        this.sltTrans = false;

        // These variables are only for lType = 2
        this.animProg = 0;
        this.sltTurn = 0; this.animDTurn = 0;
        this.animDX = 0; this.animDY = 0;
        this.sltWidth = 0; this.sltHeight = 0;
        this.animDWidth = 0; this.animDHeight = 0;

        this.pos = new Vec2();
        this.pad = new Vec2();
        this.turn = Math.floor(2 * this.txtSize * Math.random()) - this.txtSize;
        this.turnList = [];

        this.text = [];
        this.func = [];
        this.posList = [];
        this.moveFunc = [];
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



    addItem(text, func, pos, moveFunc = null, txtSize = 10, txtWidth = 100,
            txtDist = 2 * txtSize) {
        this.length += 1;
        this.text.push(text);
        this.func.push(func);
        if (this.lType === 2) {
            this.posList.push(pos);
            this.moveFunc.push(moveFunc);
            this.txtSize.push(txtSize);
            this.txtWidth.push(txtWidth);
            this.txtDist.push(txtDist);
            let turnVar = Math.floor(2 * txtSize * Math.random()) - txtSize
            this.turnList.push(turnVar);
            if (this.length === 1) {
                this.sltTurn = turnVar;
                let padder = txtDist - txtSize;
                this.sltPos.x = pos.x - padder / 2;
                this.sltPos.y = pos.y - txtDist / 2;
                this.sltWidth  = padder + txtWidth;
                this.sltHeight = txtDist;
            }
        } else {
            this.turnList.push(Math.floor(2 * this.txtSize * Math.random()) -
                this.txtSize);
        }
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
    setText(size, font, width = 100, dist = 2 * size, xOff = 5, clr = "#000",
            slt = "#FFF") {
        this.turn = Math.floor(2 * size * Math.random()) - size;

        this.txtWidth = this.lType === 2 ? [] : width;
        this.txtSize = this.lType === 2 ? [] : size;
        this.txtDist = this.lType === 2 ? [] : dist;
        this.txtXOffset = xOff;
        this.txtColor = clr;
        this.txtSelect = slt;
        this.txtFont = font;

        return this;
    }
    setType(bdr = 0, list = 0) {
        this.bType = bdr;
        this.lType = list;
        if (list === 2) {
            this.txtWidth = [];
            this.txtSize = [];
            this.txtDist = [];
            this.sltPos = new Vec2();
        }
        return this;
    }
    runOnSelf(func) {
        func(this);
        return this;
    }


    move(amt) {
        if (Menu.active) {
            if (this.lock) {
                return;
            }
            if (this.lType === 0) {
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
            } else if (this.lType === 1) {
                // TODO
            } else if (this.lType === 2) {
                let target = this.moveFunc[this.index](amt);
                this.animDTurn = this.turnList[target] - this.sltTurn;
                this.animDX = this.posList[target].x - this.sltPos.x;
                this.animDY = this.posList[target].y - this.sltPos.y;
                let padder = (this.txtDist[target] - this.txtSize[target]);
                this.animDX -= padder / 2;
                this.animDY -= this.txtDist[target] / 2;
                this.animDWidth  = padder + this.txtWidth[target] -
                    this.sltWidth;
                this.animDHeight = this.txtDist[target] - this.sltHeight;
                this.animProg = 0;
                this.index = target;
                this.sltTrans = true;
            }
        }
    }
    select() {
        if (this.lock) {
            return;
        }
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



    animate(percent) {
        if (this.startup) {
            this.lock = this.startFunc(this, percent);
        }
        if (this.lock) {
            return;
        }
        this["animate_" + this.lType](percent);
    }
    static animate(percent) {
        if (Menu.active) {
            Menu.list[Menu.top].animate(percent);
        }
    }

    animate_0(percent) {
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
    animate_1(percent) {
        //TODO
    }
    animate_2(percent) {
        if (this.sltTrans) {
            this.animProg += percent;
            if (this.animProg >= 1) {
                this.sltTurn = this.turnList[this.index];
                let padder = this.txtDist[this.index] -
                    this.txtSize[this.index];
                this.sltPos.x = this.posList[this.index].x - padder / 2;
                this.sltPos.y = this.posList[this.index].y -
                    this.txtDist[this.index] / 2;
                this.sltWidth  = padder + this.txtWidth[this.index];
                this.sltHeight = this.txtDist[this.index];
                this.sltTrans = false;
            } else {
                this.sltPos.x += percent * this.animDX;
                this.sltPos.y += percent * this.animDY;
                this.sltWidth  += percent * this.animDWidth;
                this.sltHeight += percent * this.animDHeight;
                this.sltTurn += percent * this.animDTurn;
            }
        }
    }



    static drawAll() {
        if (Menu.active) {
            if (!Menu.isOrdered) {
                Menu.order();
            }
            let i = 0, l = Menu.list.length;
            for (; i < l; i += 1) {
                Menu.draw(Menu.list[i], Menu.list[i].op *
                    ((i === Menu.top) ? 1 : 0.33));
            }
        }
    }

    static draw(mn, opMult = 1) {
        let BT = mn.bType;
        if (mn.lType === 2) {
            Menu.draw_2(mn, opMult);
            return;
        }
        // Variables for the rotation-skew of the menu boxes
        let width, height, posx, posy, padx, pady;
        width  = mn.txtWidth + mn.txtDist +
            ((BT === 0) ? ((mn.length - 1) * mn.txtXOffset) : (0));
        height = mn.length * mn.txtDist;
        posx = mn.pos.x; posy = mn.pos.y;
        padx = (2 * mn.pad.x  + mn.pad.y) / 3;
        pady = (2 * mn.pad.y  + mn.pad.x) / 3;
        if (mn.turn > 0) {
            padx += mn.turn;
        } else {
            pady -= mn.turn;
        }

        let multi = mn.sltPos % 1,
            turnVar = mn.turnList[Math.floor(mn.sltPos)];
        if (mn.sltPos % 1 !== 0) {
            if (mn.sltPos > mn.length - 1) {
                turnVar *= 1 - multi;
                turnVar += multi * mn.turnList[0];
            } else {
                turnVar *= 1 - multi;
                turnVar += multi * mn.turnList[Math.floor(mn.sltPos) + 1];
            }
        }
        if (BT < 2) {
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
            if (BT === 0) {
                ctx.lineTo(posx + width + padx, posy + height + pady);
                ctx.lineTo(posx - pady, posy + height + padx);
            } else {
                ctx.lineTo(posx + width + padx +
                    ((mn.length - 1) * mn.txtXOffset), posy + height + pady);
                ctx.lineTo(posx - pady + ((mn.length - 1) * mn.txtXOffset),
                    posy + height + padx);
            }
            ctx.closePath();
            ctx.fill();

            // Draw in menu border
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = mn.bdrColor;
            ctx.stroke();
        } else if (BT === 2) {
            ctx.globalAlpha = (mn.bgOp * opMult) * 0.5;

            let spadx = padx, spady = pady;
            if (mn.turn > 0) {
                padx -= mn.turn;
            } else {
                pady += mn.turn;
            }
            if (turnVar > 0) {
                padx += turnVar;
            } else {
                pady -= turnVar;
            }
            ctx.fillStyle = mn.bgColor;
            ctx.beginPath();
            ctx.moveTo(posx - padx, posy - pady);
            ctx.lineTo(posx + width + pady, posy - padx);
            ctx.lineTo(posx + width + padx, posy + height + pady);
            ctx.lineTo(posx - pady, posy + height + padx);
            ctx.closePath();
            ctx.fill();

            padx = spadx; pady = spady;
            var lnGrade = ctx.createLinearGradient(
                posx + width / 2, posy,
                posx + width / 2, posy + height);
            lnGrade.addColorStop(0, `#FFF`);
            lnGrade.addColorStop(1, mn.bgColor);
            ctx.fillStyle = lnGrade;

            ctx.beginPath();
            ctx.moveTo(posx - padx, posy - pady);
            ctx.lineTo(posx + width + pady, posy - padx);
            ctx.lineTo(posx + width + padx, posy + height + pady);
            ctx.lineTo(posx - pady, posy + height + padx);
            ctx.closePath();
            ctx.fill();

        }
        ctx.globalAlpha = opMult;

        // Calculate the selection region for the item selection clipping box
        let clipper = new Path2D(), anticlip = new Path2D();
        padx = (2 * mn.pad.x  + mn.pad.y) / 3;
        pady = (2 * mn.pad.y  + mn.pad.x) / 3;
        if (turnVar > 0) {
            padx += turnVar;
        } else {
            pady -= turnVar;
        }
        // Check to see if the selection box is split
        if (mn.sltPos > mn.length - 1) {
            // Create the bottom box region
            let bPosy = posy + mn.sltPos * mn.txtDist,
                bPosx = posx + (mn.txtDist - mn.txtSize) / 2 +
                    mn.sltPos * mn.txtXOffset,
                bPadx = (1 - multi) * padx, bPady = (1 - multi) * pady;
            height = Math.round(mn.txtDist * (1 - multi));
            width = mn.txtWidth + (mn.txtDist - mn.txtSize);
            clipper.moveTo(bPosx - bPadx, bPosy - bPady);
            clipper.lineTo(bPosx + width + bPady, bPosy - bPadx);
            clipper.lineTo(bPosx + width + bPadx, bPosy + height + bPady);
            clipper.lineTo(bPosx - bPady, bPosy + height + bPadx);
            clipper.closePath();

            // Create the top box region
            bPosx = posx + (mn.txtDist - mn.txtSize) / 2 +
                (mn.sltPos - mn.length) * mn.txtXOffset;
            height = Math.round(mn.txtDist * multi);
            bPadx = multi * padx; bPady = multi * pady;
            clipper.moveTo(bPosx - bPadx, posy - bPady);
            clipper.lineTo(bPosx + width + bPady, posy - bPadx);
            clipper.lineTo(bPosx + width + bPadx, posy + height + bPady);
            clipper.lineTo(bPosx - bPady, posy + height + bPadx);
            clipper.closePath();
        } else {
            // Create the selection box region
            let bPosy = posy + mn.sltPos * mn.txtDist,
                bPosx = posx + (mn.txtDist - mn.txtSize) / 2 +
                mn.sltPos * mn.txtXOffset;
            height = mn.txtDist;
            width = mn.txtWidth + (mn.txtDist - mn.txtSize);
            clipper.moveTo(bPosx - padx, bPosy - pady);
            clipper.lineTo(bPosx + width + pady, bPosy - padx);
            clipper.lineTo(bPosx + width + padx, bPosy + height + pady);
            clipper.lineTo(bPosx - pady, bPosy + height + padx);
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
                mn.pad.x + posx + (mn.txtDist - mn.txtSize) / 2 +
                j * mn.txtXOffset,
                mn.pad.y + posy + (j + 0.5) * mn.txtDist,
                mn.txtWidth);
            ctx.restore();
            if (dist < 2) {
                ctx.save();
                ctx.fillStyle = mn.txtSelect;
                ctx.clip(clipper);
                ctx.fillText(mn.text[j],
                    mn.pad.x + posx + (mn.txtDist - mn.txtSize) / 2 +
                    j * mn.txtXOffset,
                    mn.pad.y + posy + (j + 0.5) * mn.txtDist,
                    mn.txtWidth);
                ctx.restore();
            }
        }
    }

    static draw_2(mn, opMult = 1) {
        // Variables for the rotation-skew of the menu boxes
        let width, height, posx, posy, padx, pady;
        posx = mn.pos.x; posy = mn.pos.y;

        let turnVar = mn.sltTurn;
        ctx.globalAlpha = opMult;

        // Calculate the selection region for the item selection clipping box
        let clipper = new Path2D(), anticlip = new Path2D();
        padx = 2;
        pady = 2;
        if (turnVar > 0) {
            padx += turnVar;
        } else {
            pady -= turnVar;
        }
        // Create the selection region
        let bPosy = posy + mn.sltPos.y,
            bPosx = posx + mn.sltPos.x,
            bPadx = padx, bPady = pady;
        height = mn.sltHeight;
        width = mn.sltWidth;
        clipper.moveTo(bPosx - bPadx, bPosy - bPady);
        clipper.lineTo(bPosx + width + bPady, bPosy - bPadx);
        clipper.lineTo(bPosx + width + bPadx, bPosy + height + bPady);
        clipper.lineTo(bPosx - bPady, bPosy + height + bPadx);
        clipper.closePath();
        anticlip.addPath(clipper);
        anticlip.rect(0, 0, CVW, CVH);

        // Fill in the selection box
        ctx.save();
        ctx.fillStyle = mn.sltColor;
        ctx.clip(clipper);
        ctx.fillRect(0, 0, CVW, CVH);
        ctx.restore();

        // Draw the text
        ctx.textAlign = "start"; ctx.textBaseline = "middle";
        ctx.fillStyle = mn.txtColor;
        let j = mn.length - 1;
        //let distCutoff = width * width + height * height +
        //    4 * turnVar * turnVar;
        //distCutoff /= 2;
        //let sltX = mn.sltPos.x + mn.sltWidth / 2,
        //    sltY = mn.sltPos.y + mn.sltHeight / 2;
        for (; j >= 0; j -= 1) {
            ctx.font = `${mn.txtSize[j]}px ${mn.txtFont}`;
            //let xDiff = mn.posList[j].x + mn.txtWidth[j] / 2 - sltX,
            //    yDiff = mn.posList[j].y + mn.txtDist[j] / 2 - sltY;
            //let dist = xDiff * xDiff + yDiff * yDiff;
            ctx.save();
            ctx.clip(anticlip, "evenodd");
            ctx.fillText(mn.text[j],
                mn.posList[j].x + posx,
                mn.posList[j].y + posy,
                mn.txtWidth[j]);
            ctx.restore();
            //if (dist < distCutoff) {
            ctx.save();
            ctx.fillStyle = mn.txtSelect;
            ctx.clip(clipper);
            ctx.fillText(mn.text[j],
                mn.posList[j].x + posx,
                mn.posList[j].y + posy,
                mn.txtWidth[j]);
            ctx.restore();
            //}
        }
    }
}
Menu.active = false;
Menu.isOrdered = false;
Menu.list = [];
Menu.top = 0; Menu.minAct = Infinity;
