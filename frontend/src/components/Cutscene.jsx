import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import './Cutscene.css'

// Pregame broadcast cutscene (B4, reworked in Part F) — an EA-Sports-FC-style
// intro, not a travel montage. One gsap.timeline() runs four sequenced beats so
// they never race:
//   1 VS card clash → 2 paper-map flight to the destination pin → 3 hype text →
//   4 whistle countdown → hard cut, then onComplete() reveals the result.
//
// Beat 2 replaces the old black-screen 3D stadium flyover with a vintage
// aeronautical-chart: an aged parchment map with a graticule + compass, a dashed
// flight arc that draws as a plane glyph flies along it, ending on a dropped pin
// at the destination city. Pure SVG + GSAP (no three.js here any more). The map's
// sepia/parchment palette is a deliberate, self-contained cinematic prop — the
// product chrome and its role-locked accents are untouched. All copy stays on the
// site stack (Barlow Condensed display, Noto Sans body). data-beat exposes the
// active beat for tests; skippable; degrades to an instant reveal under reduced
// motion.

// Host-nation outlines for the chart (6a). Real Natural Earth boundaries for
// Canada, the USA and Mexico (from src/data/countryShapes.json), simplified and
// pre-projected into this SVG's 1000×600 space — inlined so the full boundary
// JSON never enters the Simulator bundle. Drawn as a faint sepia land layer
// beneath the flight arc, so the route and pin always sit on top.
const GEO = {
  canada:
    'M449.7,299.2 L440.2,292.3 L436.9,289.3 L428.6,286.4 L426.0,280.2 L426.7,275.9 L420.8,272.9 L420.0,267.3 L414.5,262.2 L416.9,255.2 L416.8,250.8 L408.9,246.4 L404.3,238.5 L401.4,233.4 L397.2,230.3 L394.1,227.4 L391.6,223.8 L387.0,226.1 L382.6,229.9 L378.5,225.4 L375.3,222.3 L370.8,220.4 L366.3,220.2 L366.3,180.4 L366.3,154.5 L374.9,156.2 L382.1,159.5 L386.9,160.1 L390.9,157.2 L396.5,155.0 L403.3,155.9 L410.2,152.9 L417.8,151.1 L420.9,154.0 L424.3,152.4 L425.4,149.1 L428.5,149.8 L436.3,156.1 L442.4,151.3 L443.0,156.6 L448.7,155.5 L450.4,153.4 L456.0,153.8 L463.0,156.8 L473.8,159.4 L480.1,160.6 L484.6,160.1 L490.8,163.6 L484.4,167.1 L492.6,168.6 L505.0,167.8 L508.9,166.6 L513.9,170.8 L518.9,167.2 L514.2,164.3 L517.1,161.9 L522.7,161.5 L526.4,160.8 L530.1,162.5 L534.7,166.3 L539.9,165.7 L548.0,168.9 L555.1,167.8 L561.8,168.0 L561.3,163.6 L565.4,162.4 L572.5,164.7 L572.4,171.4 L575.4,165.8 L579.1,166.0 L581.2,158.9 L576.3,154.6 L570.9,151.8 L571.2,144.1 L576.7,139.0 L582.7,140.2 L587.4,143.2 L593.6,151.1 L589.5,154.5 L598.1,155.9 L598.1,163.1 L604.2,157.6 L609.7,162.1 L608.3,167.3 L612.8,172.0 L617.6,167.0 L620.9,161.0 L621.2,153.3 L627.7,153.8 L634.5,154.8 L640.7,158.3 L637.6,165.5 L640.8,169.2 L640.2,172.6 L631.2,177.5 L624.8,178.6 L620.0,176.5 L618.7,180.0 L614.3,185.9 L612.9,188.9 L607.6,193.7 L601.0,194.2 L597.4,197.1 L597.1,201.6 L591.7,202.5 L586.1,208.2 L581.1,216.0 L579.3,221.6 L579.1,229.7 L585.8,230.9 L587.9,237.4 L590.0,242.7 L596.5,241.3 L605.0,244.3 L609.6,247.0 L612.9,250.3 L618.7,252.2 L623.5,255.2 L631.1,255.6 L636.1,256.2 L635.3,262.3 L636.8,269.3 L640.1,277.1 L647.0,283.8 L650.5,281.5 L653.0,274.3 L650.6,263.3 L647.3,259.6 L654.7,256.3 L659.9,251.4 L662.5,246.6 L662.1,241.9 L659.0,236.0 L653.4,230.7 L658.8,223.4 L656.8,217.0 L655.2,206.1 L658.5,204.5 L666.3,206.4 L671.1,207.1 L674.9,205.3 L679.1,207.6 L684.8,211.6 L686.2,214.4 L694.4,214.9 L694.3,220.8 L695.8,229.6 L700.0,230.7 L703.3,234.8 L710.0,230.9 L714.3,223.2 L717.4,220.0 L721.0,226.2 L727.0,235.1 L732.0,243.5 L730.2,247.9 L736.3,251.8 L740.4,255.9 L747.7,257.6 L750.7,259.9 L752.5,265.8 L756.1,266.7 L757.9,269.4 L758.3,277.2 L755.0,279.8 L751.6,282.3 L744.1,284.8 L738.3,290.5 L730.6,291.6 L720.7,290.2 L713.8,290.1 L709.1,290.6 L705.2,295.6 L699.4,298.7 L692.7,308.0 L687.5,314.4 L691.3,313.2 L698.7,304.1 L708.4,298.3 L715.2,297.6 L719.3,301.0 L714.9,305.7 L716.4,313.2 L717.9,318.5 L723.9,322.0 L731.5,321.0 L736.1,313.1 L736.4,318.2 L739.4,320.7 L733.7,325.3 L723.5,329.5 L718.9,332.2 L713.8,337.3 L710.3,336.8 L710.2,330.9 L718.1,325.1 L710.8,325.3 L705.7,326.2 L702.7,322.3 L702.7,312.7 L700.6,310.7 L697.6,311.8 L696.0,310.0 L692.5,315.3 L691.1,320.7 L689.5,323.9 L687.5,325.0 L685.6,327.1 L677.1,327.1 L670.1,327.1 L668.1,328.4 L663.2,333.4 L661.2,336.7 L656.9,336.7 L652.4,336.7 L650.4,337.8 L651.5,341.3 L645.4,345.5 L640.7,346.6 L635.3,350.3 L632.6,349.3 L633.2,345.1 L635.4,341.3 L636.7,337.1 L635.8,331.1 L634.8,324.7 L630.1,321.4 L628.7,319.3 L627.5,316.6 L624.6,315.7 L620.6,311.6 L616.9,309.3 L612.4,306.6 L608.1,304.1 L604.0,306.0 L596.8,304.3 L593.1,305.2 L588.6,303.0 L583.9,301.9 L580.7,301.5 L578.5,296.5 L576.9,299.2 L567.4,299.2 L551.7,299.2 L536.0,299.2 L522.3,299.2 L508.5,299.2 L494.9,299.2 L480.9,299.2 L476.4,299.2 L462.8,299.2 L449.7,299.2Z M652.2,136.0 L656.6,133.2 L666.7,136.8 L673.1,140.1 L673.7,143.2 L682.2,141.5 L687.0,146.0 L698.1,148.7 L702.1,151.6 L706.4,158.1 L698.0,161.4 L708.8,165.9 L716.1,167.5 L722.7,173.9 L730.0,174.4 L728.5,179.3 L720.4,187.4 L714.8,184.4 L707.6,177.7 L701.6,178.6 L701.1,182.6 L705.9,186.6 L712.1,189.8 L714.0,191.7 L717.0,198.6 L715.4,203.7 L709.6,201.7 L698.1,196.1 L704.6,202.2 L709.4,206.4 L697.7,206.0 L687.8,202.0 L682.2,198.6 L683.8,196.6 L677.0,193.0 L670.3,189.6 L657.1,192.8 L653.2,190.4 L656.2,185.2 L664.8,185.1 L674.3,184.2 L672.8,181.7 L674.4,178.2 L680.3,171.5 L679.0,168.3 L677.3,165.9 L670.3,162.6 L660.9,160.2 L663.9,158.4 L659.0,154.1 L655.0,153.6 L651.3,151.3 L648.9,153.4 L640.5,154.3 L623.9,152.7 L614.1,150.6 L606.7,149.6 L602.9,147.1 L607.6,143.9 L601.1,143.9 L599.6,136.8 L603.2,130.6 L607.9,127.7 L619.8,125.9 L616.4,130.4 L620.0,134.8 L624.3,129.1 L635.9,126.2 L643.8,133.4 L643.1,138.1 L652.2,136.0Z M593.3,69.4 L600.1,68.0 L605.5,67.8 L614.5,66.6 L621.3,64.1 L627.0,64.4 L631.9,66.4 L635.4,62.6 L641.5,61.5 L649.7,60.7 L663.8,60.4 L666.2,61.2 L679.5,60.0 L689.4,60.4 L699.4,60.8 L711.7,61.4 L721.6,62.3 L730.0,64.2 L718.6,69.1 L707.4,70.5 L703.3,72.1 L713.3,72.0 L702.4,76.3 L694.9,78.2 L687.1,84.0 L677.6,85.2 L674.7,86.6 L660.8,87.3 L667.1,88.2 L663.9,89.4 L667.7,92.8 L663.4,95.3 L656.3,97.2 L654.1,100.0 L647.7,102.1 L656.2,103.4 L644.0,109.3 L632.0,107.4 L618.5,108.4 L611.6,107.6 L603.0,107.2 L602.4,103.9 L610.9,102.3 L608.6,97.2 L611.4,96.8 L623.7,99.8 L617.4,95.3 L610.0,94.0 L613.7,91.2 L621.8,89.6 L623.2,87.1 L616.6,84.4 L614.7,80.8 L627.3,81.1 L630.9,81.9 L638.1,79.4 L627.7,78.5 L611.6,78.9 L603.5,76.6 L599.7,73.8 L594.3,71.7 L593.3,69.4Z',
  usa:
    'M449.7,299.2 L462.8,299.2 L476.4,299.2 L480.9,299.2 L494.9,299.2 L508.5,299.2 L522.3,299.2 L536.0,299.2 L551.7,299.2 L567.4,299.2 L576.9,299.2 L578.5,296.5 L579.3,300.3 L583.9,301.9 L588.6,303.0 L593.1,305.2 L596.8,304.3 L602.4,306.1 L608.1,304.1 L612.4,306.6 L616.9,309.3 L620.6,311.6 L624.1,313.9 L625.7,316.4 L627.8,318.2 L629.9,319.3 L634.8,324.7 L635.8,331.1 L636.7,337.1 L635.4,341.3 L633.2,345.1 L632.2,347.6 L634.2,350.3 L640.7,346.6 L645.4,345.5 L651.4,342.1 L650.4,337.8 L652.4,336.7 L656.9,336.7 L661.2,336.7 L662.6,334.0 L668.1,328.4 L670.1,327.1 L677.1,327.1 L685.6,327.1 L687.5,325.0 L689.5,323.9 L691.1,320.7 L692.5,315.3 L696.0,310.0 L697.6,311.8 L700.6,310.7 L702.7,312.7 L702.7,322.3 L705.7,326.2 L701.6,331.8 L696.8,334.3 L692.0,336.4 L689.5,340.5 L688.7,345.7 L690.3,349.4 L691.7,347.1 L692.6,350.6 L689.6,351.7 L684.0,352.9 L679.3,353.6 L675.5,355.6 L682.2,354.3 L677.2,357.7 L674.2,357.7 L673.3,364.1 L669.9,369.5 L668.6,367.3 L667.1,365.6 L668.1,369.4 L669.3,373.3 L667.8,375.9 L665.2,381.5 L666.2,376.5 L663.9,373.8 L663.3,368.0 L662.5,371.0 L663.4,375.5 L660.4,374.4 L663.6,376.6 L663.7,383.3 L665.5,386.2 L666.2,393.2 L663.3,398.4 L658.5,400.5 L655.5,404.5 L653.2,405.0 L650.9,407.6 L645.2,414.4 L642.6,417.8 L640.4,421.9 L639.7,426.9 L640.5,431.7 L642.1,437.7 L644.1,442.7 L646.3,453.8 L646.1,458.5 L644.8,465.4 L641.2,465.5 L640.4,462.4 L638.7,460.8 L636.3,454.8 L634.1,449.4 L634.4,442.1 L633.1,438.3 L629.5,432.4 L623.1,434.5 L620.0,430.9 L617.2,429.2 L612.0,430.1 L607.9,429.3 L604.4,429.7 L602.5,430.8 L603.2,435.5 L599.9,438.1 L596.6,437.9 L593.1,434.2 L589.1,435.1 L585.8,433.5 L582.9,434.0 L579.1,435.6 L574.9,440.8 L570.3,443.8 L567.8,447.1 L566.7,450.3 L566.7,455.1 L567.8,460.8 L562.7,459.5 L559.2,457.3 L557.9,454.0 L556.9,449.2 L554.2,445.2 L552.5,441.1 L550.2,436.3 L547.0,433.5 L543.3,433.6 L540.4,439.2 L536.6,437.1 L534.2,435.0 L533.0,431.1 L531.5,427.5 L528.8,424.4 L526.4,422.2 L524.7,419.7 L516.8,419.7 L513.2,422.6 L504.0,422.7 L493.5,417.7 L486.6,414.3 L481.2,413.7 L475.9,414.2 L475.2,410.7 L472.2,406.7 L470.1,405.8 L467.0,403.5 L465.3,401.6 L461.1,400.9 L459.4,395.9 L454.9,388.9 L451.0,379.2 L449.2,375.3 L445.6,369.4 L445.0,363.7 L442.5,359.9 L443.5,354.1 L443.4,348.1 L441.9,342.7 L443.7,336.2 L444.3,329.8 L444.8,323.5 L444.0,314.2 L442.5,308.1 L441.2,304.9 L448.4,305.9 L450.9,312.5 L451.3,304.9 L449.7,299.2Z M366.3,154.5 L366.3,180.4 L366.3,220.2 L370.8,220.4 L375.3,222.3 L378.5,225.4 L382.6,229.9 L387.0,226.1 L391.6,223.8 L394.1,227.4 L397.2,230.3 L401.4,233.4 L404.3,238.5 L408.9,246.4 L416.8,250.8 L416.9,255.2 L414.3,258.7 L411.8,256.0 L407.8,253.8 L406.5,247.7 L400.5,242.0 L398.1,235.5 L393.6,235.0 L386.3,234.8 L381.0,232.8 L371.5,225.5 L367.0,224.2 L359.0,221.8 L352.7,222.3 L343.6,219.1 L338.2,216.2 L333.1,217.6 L334.0,222.5 L331.5,223.0 L326.1,224.4 L322.1,226.7 L317.0,228.2 L316.4,224.1 L318.4,217.2 L323.3,215.1 L316.2,217.2 L313.0,221.9 L306.4,226.9 L309.8,230.3 L305.5,235.3 L300.5,238.2 L295.9,240.4 L294.8,243.4 L287.6,247.1 L286.2,250.4 L280.8,253.3 L277.6,252.8 L273.3,254.8 L268.7,257.1 L264.8,259.4 L256.9,261.5 L261.3,257.0 L265.8,254.8 L270.7,251.0 L276.4,250.2 L278.6,247.3 L285.0,243.2 L289.4,239.3 L290.2,234.0 L292.6,229.9 L287.3,232.0 L283.3,233.4 L280.3,229.8 L279.0,232.3 L277.3,228.8 L272.7,231.6 L269.9,231.6 L269.5,227.4 L267.4,222.4 L261.4,223.7 L257.5,220.4 L254.4,218.8 L254.4,214.9 L250.8,211.8 L252.6,207.9 L256.3,204.0 L258.0,200.3 L261.7,199.8 L264.8,200.9 L268.6,197.6 L271.9,198.2 L275.4,196.0 L274.5,192.8 L272.0,191.6 L275.4,188.9 L272.6,188.9 L267.7,190.5 L262.6,190.5 L256.2,191.2 L249.4,189.6 L247.5,186.8 L241.7,182.7 L248.1,179.8 L258.4,176.3 L262.2,176.3 L261.5,179.8 L271.2,179.6 L267.5,175.2 L261.9,172.6 L258.6,169.1 L254.2,166.1 L247.9,163.9 L250.5,160.3 L258.6,160.0 L264.4,156.9 L265.5,153.4 L270.2,150.1 L274.7,149.3 L283.4,146.2 L287.6,146.7 L294.7,142.9 L301.6,144.4 L305.0,147.6 L307.0,146.2 L314.8,146.7 L321.5,149.4 L326.2,148.7 L335.9,151.0 L344.7,151.6 L348.2,152.5 L354.4,151.4 L361.3,153.5 L366.3,154.5Z',
  mexico:
    'M475.9,414.2 L481.2,413.7 L487.0,413.0 L493.5,417.7 L504.0,422.7 L513.2,422.6 L516.8,422.6 L524.7,419.7 L526.4,422.2 L528.8,424.4 L531.5,427.5 L533.0,431.1 L534.2,435.0 L536.6,437.1 L540.4,439.2 L543.3,433.6 L547.0,433.5 L550.2,436.3 L552.5,441.1 L554.2,445.2 L556.9,449.2 L557.9,454.0 L559.2,457.3 L562.7,459.5 L566.0,461.0 L566.0,467.0 L565.2,472.0 L564.9,481.4 L564.4,484.8 L565.2,488.6 L566.7,492.0 L567.6,497.4 L570.6,502.6 L571.7,506.6 L573.5,510.0 L578.4,511.9 L580.3,514.8 L584.3,512.9 L587.8,512.2 L591.2,510.9 L594.1,509.7 L597.1,506.9 L598.2,502.8 L598.5,496.9 L602.4,493.0 L607.3,491.4 L611.4,491.6 L614.2,491.1 L615.1,495.9 L612.6,500.0 L611.5,504.3 L611.7,508.6 L610.5,514.0 L608.4,512.3 L605.9,516.7 L600.3,517.1 L596.0,517.1 L596.0,521.1 L597.3,525.0 L598.5,529.3 L592.6,529.3 L590.4,535.0 L590.4,540.0 L585.2,532.5 L582.8,530.2 L579.1,528.4 L576.5,528.9 L572.8,531.5 L570.5,532.2 L567.2,530.4 L563.8,529.0 L559.5,525.8 L556.0,524.8 L550.8,521.6 L547.0,518.3 L543.3,516.0 L538.6,513.8 L536.6,510.6 L531.7,506.6 L529.4,502.2 L528.3,498.8 L529.4,496.1 L530.4,491.9 L528.9,488.8 L527.0,482.5 L522.9,475.5 L518.3,470.1 L516.1,465.7 L512.1,462.9 L512.0,456.8 L509.6,455.2 L506.9,451.8 L505.8,446.9 L503.3,446.4 L500.6,442.7 L498.5,439.3 L495.8,431.8 L494.2,426.4 L490.9,421.0 L486.7,419.4 L486.0,422.3 L486.8,425.6 L487.2,430.8 L488.8,433.7 L492.2,438.5 L493.7,440.7 L495.1,442.9 L496.0,447.5 L497.4,449.2 L498.4,451.7 L501.3,455.3 L502.8,461.8 L504.2,464.9 L505.4,468.1 L505.7,471.8 L509.8,475.2 L511.4,478.4 L509.4,482.1 L507.3,477.9 L504.3,473.9 L501.0,470.5 L498.7,468.7 L498.8,463.6 L498.1,459.8 L495.9,457.7 L492.8,454.5 L488.2,452.0 L485.5,447.9 L489.4,445.1 L486.1,437.0 L483.3,435.0 L481.6,430.7 L479.9,426.1 L477.8,420.5 L475.9,414.2Z',
}

// A top-down airliner glyph centred on its own origin so translate+rotate along
// the flight path orients it nose-first (nose at +X). Fuselage, swept delta
// wings and a tailplane — an actual plane silhouette, not an arrow.
function PlaneGlyph() {
  return (
    <g className="cut__plane">
      <path
        d="M17,0 L5,1.4 L3,1.4 L-3,8 L-5,8 L-1,1.4 L-11,1.4 L-11,4.5 L-15,4.5 L-16,1 L-16,0 L-16,-1 L-15,-4.5 L-11,-4.5 L-11,-1.4 L-1,-1.4 L-5,-8 L-3,-8 L3,-1.4 L5,-1.4 Z"
        fill="var(--cut-ink)"
        stroke="var(--cut-parchment)"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </g>
  )
}

export default function Cutscene({ match, onComplete }) {
  const { home, away, homeFlag, awayFlag, homeCode, awayCode, venue, hype } = match
  const rootRef = useRef(null)
  const pathRef = useRef(null)
  const planeRef = useRef(null)
  const tlRef = useRef(null)
  const doneRef = useRef(false)
  const [beat, setBeat] = useState('vs')

  const finish = () => {
    if (!doneRef.current) {
      doneRef.current = true
      onComplete?.()
    }
  }

  useEffect(() => {
    const root = rootRef.current
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const q = gsap.utils.selector(root)

    if (reduce) {
      // Reduced motion: hold the VS card briefly, then reveal — no motion.
      const t = setTimeout(finish, 700)
      return () => clearTimeout(t)
    }

    const tl = gsap.timeline({ onComplete: finish })
    tlRef.current = tl

    // --- Beat 1 — VS card clash ---
    setBeat('vs')
    tl.fromTo(q('.cut__side--home'), { xPercent: -160, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.5, ease: 'power4.out' }, 0)
    tl.fromTo(q('.cut__side--away'), { xPercent: 160, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.5, ease: 'power4.out' }, 0)
    tl.fromTo(q('.cut__vs-badge'), { scale: 0, rotate: -35 }, { scale: 1, rotate: 0, duration: 0.34, ease: 'back.out(2.4)' }, 0.26)
    tl.to(q('.cut__vs-badge'), { scale: 1.12, duration: 0.16, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0.6)
    tl.to(q('.cut__vs'), { autoAlpha: 0, scale: 1.14, duration: 0.34, ease: 'power2.in' }, '+=0.9')

    // --- Beat 2 — paper-map flight to the destination pin ---
    tl.add(() => setBeat('flight'))
    tl.fromTo(q('.cut__map'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out' }, '<')
    tl.fromTo(q('.cut__caption--venue'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '<0.2')

    // Fly the plane along the (statically dashed, vintage-chart) route: one
    // progress tween samples the path so the nose always points along the arc.
    const path = pathRef.current
    const plane = planeRef.current
    const len = path.getTotalLength()
    gsap.set(plane, { autoAlpha: 1 })
    const prog = { t: 0 }
    tl.to(
      prog,
      {
        t: 1,
        duration: 1.9,
        ease: 'power1.inOut',
        onUpdate: () => {
          const d = prog.t * len
          const p = path.getPointAtLength(d)
          const p2 = path.getPointAtLength(Math.min(d + 1, len))
          const ang = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI
          plane.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${ang})`)
        },
      },
      '<0.1',
    )

    // Pin drops in as the plane lands on it; the plane fades once parked.
    tl.fromTo(q('.cut__pin'), { scale: 0, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.42, ease: 'back.out(2.2)' }, '>-0.35')
    tl.to(q('.cut__pin-pulse'), { scale: 2.4, opacity: 0, duration: 0.7, ease: 'power2.out' }, '<')
    tl.to(plane, { autoAlpha: 0, duration: 0.3 }, '<0.2')
    tl.to(q('.cut__caption--venue'), { opacity: 0, duration: 0.3 }, '+=0.5')
    tl.to(q('.cut__map'), { autoAlpha: 0, duration: 0.35 }, '<')

    // --- Beat 3 — hype text ---
    tl.add(() => setBeat('hype'))
    tl.fromTo(q('.cut__hype-line'), { opacity: 0, x: -48, skewX: -10 }, { opacity: 1, x: 0, skewX: 0, duration: 0.42, stagger: 0.5, ease: 'power3.out' }, '<0.1')
    tl.to({}, { duration: 0.7 })
    tl.to(q('.cut__hype'), { autoAlpha: 0, duration: 0.3 }, '+=0')

    // --- Beat 4 — whistle countdown + hard cut ---
    tl.add(() => setBeat('count'))
    for (const n of ['3', '2', '1']) {
      tl.add(() => {
        const el = q('.cut__count')[0]
        if (el) el.textContent = n
      })
      tl.fromTo(q('.cut__count'), { scale: 1.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.2, ease: 'power2.out' })
      tl.to(q('.cut__count'), { opacity: 0, duration: 0.18, ease: 'power2.in' }, '+=0.22')
    }
    tl.to(q('.cut__flash'), { opacity: 1, duration: 0.14, ease: 'power2.in' })

    return () => tl.kill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const skip = () => {
    tlRef.current?.kill()
    finish()
  }

  return (
    <div className="cutscene" ref={rootRef} data-beat={beat} role="dialog" aria-label="Pregame sequence">
      {/* Beat 2 — vintage aeronautical chart */}
      <div className="cut__map" aria-hidden="true">
        <svg className="cut__chart" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="cut-grat" width="62.5" height="62.5" patternUnits="userSpaceOnUse">
              <path d="M62.5 0 H0 V62.5" fill="none" stroke="var(--cut-line)" strokeWidth="1" />
            </pattern>
            <radialGradient id="cut-vignette" cx="50%" cy="46%" r="72%">
              <stop offset="55%" stopColor="transparent" />
              <stop offset="100%" stopColor="var(--cut-vignette)" />
            </radialGradient>
          </defs>

          <rect width="1000" height="600" fill="url(#cut-grat)" />

          {/* Host-nation coastlines (6a) — a faint sepia land layer under the route. */}
          <g className="cut__geo" aria-hidden="true">
            <path d={GEO.canada} />
            <path d={GEO.usa} />
            <path d={GEO.mexico} />
          </g>

          {/* Ornamental double border */}
          <rect x="24" y="24" width="952" height="552" fill="none" stroke="var(--cut-frame)" strokeWidth="3" />
          <rect x="34" y="34" width="932" height="532" fill="none" stroke="var(--cut-frame)" strokeWidth="1" />

          {/* Compass rose, lower-left */}
          <g className="cut__compass" transform="translate(120 470)">
            <circle r="46" fill="none" stroke="var(--cut-frame)" strokeWidth="1.5" />
            <circle r="30" fill="none" stroke="var(--cut-line)" strokeWidth="1" />
            <path d="M0 -52 L9 -6 L0 0 L-9 -6 Z" fill="var(--cut-frame)" />
            <path d="M0 52 L9 6 L0 0 L-9 6 Z" fill="var(--cut-line)" />
            <path d="M52 0 L6 9 L0 0 L6 -9 Z" fill="var(--cut-line)" />
            <path d="M-52 0 L-6 9 L0 0 L-6 -9 Z" fill="var(--cut-line)" />
            <text x="0" y="-58" className="cut__compass-n">N</text>
          </g>

          {/* Flight arc: origin (lower-left) → destination (upper-right). */}
          <path
            ref={pathRef}
            className="cut__route"
            d="M170 430 Q 470 90 800 235"
            fill="none"
            stroke="var(--cut-route)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="9 10"
          />
          <circle className="cut__origin" cx="170" cy="430" r="7" fill="var(--cut-route)" />

          {/* Destination pin at the arc end (800, 235). */}
          <g className="cut__pin" transform="translate(800 235)">
            <circle className="cut__pin-pulse" cx="0" cy="0" r="12" fill="none" stroke="var(--cut-route)" strokeWidth="2.5" />
            <path d="M0 4 C -12 -12 -12 -26 0 -34 C 12 -26 12 -12 0 4 Z" fill="var(--cut-route)" stroke="var(--cut-parchment)" strokeWidth="1.5" />
            <circle cx="0" cy="-20" r="5.5" fill="var(--cut-parchment)" />
          </g>

          <g ref={planeRef} className="cut__plane-wrap" style={{ opacity: 0 }}>
            <PlaneGlyph />
          </g>

          <rect width="1000" height="600" fill="url(#cut-vignette)" />
        </svg>
      </div>

      <p className="cut__caption cut__caption--venue">
        {venue.name}
        <span className="cut__caption-city">Arriving · {venue.city}</span>
      </p>

      {/* Beat 1 — VS card */}
      <div className="cut__vs">
        <div className="cut__side cut__side--home">
          {homeFlag && <img className="cut__flag" src={homeFlag} alt="" width="120" height="90" />}
          <span className="cut__code">{homeCode}</span>
          <span className="cut__team display">{home}</span>
        </div>
        <span className="cut__vs-badge display">VS</span>
        <div className="cut__side cut__side--away">
          {awayFlag && <img className="cut__flag" src={awayFlag} alt="" width="120" height="90" />}
          <span className="cut__code">{awayCode}</span>
          <span className="cut__team display">{away}</span>
        </div>
      </div>

      {/* Beat 3 — hype */}
      <div className="cut__hype">
        {hype.map((line, i) => (
          <p className="cut__hype-line" key={i}>{line}</p>
        ))}
      </div>

      {/* Beat 4 — countdown + hard cut */}
      <div className="cut__count display" aria-hidden="true" />
      <div className="cut__flash" aria-hidden="true" />
      <button className="cut__skip" type="button" onClick={skip}>Skip ›</button>
    </div>
  )
}
