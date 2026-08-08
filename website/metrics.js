/* Live homelab telemetry.
 *
 * Renders metrics.json - a sanitised Prometheus snapshot published to S3 every
 * 15 minutes by the metrics_publisher Ansible role. Every panel is optional:
 * whatever the publisher could not collect is simply not drawn, so a dead
 * exporter costs one panel rather than the whole section.
 */
(function () {
  "use strict";

  var METRICS_URL = "https://s3.amazonaws.com/gregchow.jsonbucket/metrics.json";

  var root = document.getElementById("tm-root");
  if (!root) return;

  var tip = document.getElementById("tm-tip");
  var SVGNS = "http://www.w3.org/2000/svg";

  // ------------------------------------------------------------- utilities

  function $(id) { return document.getElementById(id); }

  function el(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function div(cls, text) {
    var d = document.createElement("div");
    if (cls) d.className = cls;
    if (text !== undefined) d.textContent = text;
    return d;
  }

  function css(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  /* Tooltip content is a list of parts, not an HTML string: every tooltip
 * interpolates a name from the snapshot, and a name must not open a tag. */
  var BR = { br: true };
  function bold(text) { return { b: text }; }
  function muted(text) { return { k: text }; }

  function showTip(evt, parts) {
    if (!tip) return;
    while (tip.firstChild) tip.removeChild(tip.firstChild);
    parts.forEach(function (p) {
      if (typeof p === "string") {
        tip.appendChild(document.createTextNode(p));
      } else if (!p) {
        return;
      } else if (p.br) {
        tip.appendChild(document.createElement("br"));
      } else if (p.b !== undefined) {
        var b = document.createElement("b");
        b.textContent = p.b;
        tip.appendChild(b);
      } else if (p.k !== undefined) {
        tip.appendChild(spanEl("k", p.k));
      }
    });
    tip.classList.add("on");
    var pad = 14;
    var r = tip.getBoundingClientRect();
    var x = evt.clientX + pad;
    var y = evt.clientY - r.height - pad;
    if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - pad;
    if (y < 8) y = evt.clientY + pad;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }

  function hideTip() { if (tip) tip.classList.remove("on"); }

  function fmtDate(ts) {
    return new Date(ts * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function show(id) { var n = $(id); if (n) n.removeAttribute("hidden"); }

  /* Table twin for a chart. Built as DOM rather than an HTML string so a
   * label from the snapshot can never be parsed as markup. */
  function fillTable(id, headers, rows) {
    var host = $(id);
    if (!host) return;
    var table = document.createElement("table");
    table.className = "tm-table";

    var thead = document.createElement("thead");
    var hr = document.createElement("tr");
    headers.forEach(function (h) {
      var th = document.createElement("th");
      th.textContent = h;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    rows.forEach(function (cells) {
      var tr = document.createElement("tr");
      cells.forEach(function (c) {
        var td = document.createElement("td");
        td.textContent = c;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    host.innerHTML = "";
    host.appendChild(table);
  }

  // ------------------------------------------------------------ sparklines

  function sparkline(values, w, h, hue) {
    var svg = el("svg", { "class": "tm-spark", width: w, height: h, viewBox: "0 0 " + w + " " + h });
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    var span = (max - min) || 1;
    var x = function (i) { return (i / (values.length - 1)) * (w - 6) + 3; };
    var y = function (v) { return h - 4 - ((v - min) / span) * (h - 8); };

    var d = "";
    for (var i = 0; i < values.length; i++) {
      d += (i ? "L" : "M") + x(i).toFixed(1) + " " + y(values[i]).toFixed(1);
    }
    svg.appendChild(el("path", {
      d: d, fill: "none", stroke: css("--tm-deemph"),
      "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round"
    }));

    // the current period carries the accent; the history stays recessive
    var last = values.length - 1;
    if (last > 0) {
      svg.appendChild(el("path", {
        d: "M" + x(last - 1).toFixed(1) + " " + y(values[last - 1]).toFixed(1) +
           "L" + x(last).toFixed(1) + " " + y(values[last]).toFixed(1),
        fill: "none", stroke: hue, "stroke-width": 2, "stroke-linecap": "round"
      }));
    }
    svg.appendChild(el("circle", {
      cx: x(last), cy: y(values[last]), r: 3.5,
      fill: hue, stroke: css("--tm-surface-2"), "stroke-width": 2
    }));
    return svg;
  }

  // -------------------------------------------------------------- KPI row

  function renderKpi(m) {
    var host = $("tm-kpi");
    var tiles = [];

    if (m.availability) {
      tiles.push({
        hero: true,
        lbl: "Fleet availability",
        val: m.availability.overall_pct.toFixed(2) + "%",
        sub: m.availability.services_monitored + " services · " + m.window_days + "-day window",
        spark: m.availability.sparkline,
        hue: css("--tm-good")
      });
    }

    if (m.fleet) {
      tiles.push({
        lbl: "Guests running",
        val: String(m.fleet.guests_running),
        sub: m.fleet.lxc + " LXC · " + m.fleet.vm + " VM · of " +
             m.fleet.guests_total + " provisioned"
      });
    }

    if (m.wan && m.wan.series.length) {
      var latest = m.wan.series[m.wan.series.length - 1];
      tiles.push({
        lbl: "WAN download",
        val: Math.round(latest.down) + " Mbps",
        sub: "daily mean, last sample",
        spark: m.wan.series.map(function (p) { return p.down; }),
        hue: css("--tm-series-1")
      });
    }

    if (m.density && m.density.cores) {
      tiles.push({
        lbl: "CPU oversubscription",
        val: m.density.cpu_overcommit.toFixed(1) + "x",
        sub: m.density.vcpu_committed + " vCPU committed on " +
             m.density.cores + " physical cores"
      });
    }

    if (m.storage && m.storage.tiers && m.storage.tiers.length) {
      tiles.push({
        lbl: "Storage in use",
        val: m.storage.used_tb.toFixed(1) + " TB",
        sub: "of " + m.storage.total_tb.toFixed(1) + " TB across " +
             m.storage.tiers.length + " datastores"
      });
    }

    if (m.observability) {
      var o = m.observability;
      var bits = [];
      if (o.metric_names) bits.push(o.metric_names + " metric names");
      if (o.samples_per_sec) bits.push(o.samples_per_sec + " samples/s");
      if (o.retention) bits.push(o.retention + " retention");
      tiles.push({
        lbl: "Active time series",
        val: o.active_series.toLocaleString(),
        sub: bits.join(" · ")
      });
    }

    if (m.targets) {
      tiles.push({
        lbl: "Scrape targets up",
        val: m.targets.up + " / " + m.targets.total,
        sub: "Prometheus endpoints healthy"
      });
    } else if (typeof m.images_updated === "number") {
      tiles.push({
        lbl: "Images auto-updated",
        val: String(m.images_updated),
        sub: "by Watchtower, " + m.window_days + "d"
      });
    }

    if (!tiles.length) return false;

    tiles.forEach(function (t) {
      var card = div("tm-tile" + (t.hero ? " hero" : ""));
      card.appendChild(div("lbl", t.lbl));
      card.appendChild(div("val", t.val));
      card.appendChild(div("sub", t.sub));
      if (t.spark && t.spark.length > 1) {
        card.appendChild(sparkline(t.spark, t.hero ? 260 : 150, t.hero ? 40 : 30, t.hue));
      }
      host.appendChild(card);
    });

    var stamp = $("tm-stamp");
    if (stamp) {
      stamp.textContent = "updated " + new Date(m.generated * 1000)
        .toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    }
    return true;
  }

  // ----------------------------------------------- WAN (small multiples)

  var WAN_SPECS = [
    { key: "down", name: "Download", unit: "Mbps", hue: "--tm-series-1", dec: 0 },
    { key: "up",   name: "Upload",   unit: "Mbps", hue: "--tm-series-3", dec: 1 },
    { key: "ping", name: "Latency",  unit: "ms",   hue: "--tm-series-2", dec: 1 }
  ];

  function renderWan(m) {
    if (!m.wan || m.wan.series.length < 2) return false;
    var host = $("tm-wan");
    var series = m.wan.series;

    WAN_SPECS.forEach(function (spec) {
      if (series[series.length - 1][spec.key] === undefined) return;

      var card = div("tm-card");
      var cap = div("cap");
      cap.appendChild(spanEl("n", spec.name));
      cap.appendChild(spanEl("v", series[series.length - 1][spec.key].toFixed(spec.dec)));
      cap.appendChild(spanEl("u", spec.unit));
      card.appendChild(cap);

      var svg = el("svg", { "class": "tm-plot" });
      card.appendChild(svg);
      host.appendChild(card);

      var draw = function () { drawArea(svg, series, spec); };
      draw();
      if (window.ResizeObserver) new ResizeObserver(draw).observe(card);
      else window.addEventListener("resize", draw);
    });

    buildWanTable(m);
    return true;
  }

  function spanEl(cls, text) {
    var s = document.createElement("span");
    s.className = cls;
    s.textContent = text;
    return s;
  }

  function niceStep(span) {
    var raw = span / 3;
    var mag = Math.pow(10, Math.floor(Math.log10(raw)));
    var norm = raw / mag;
    var mult = norm >= 5 ? 5 : norm >= 2 ? 2 : 1;
    return mult * mag;
  }

  function fmtTick(v) {
    if (v >= 1000) return (v / 1000).toFixed(v % 1000 ? 1 : 0) + "k";
    return v % 1 ? v.toFixed(1) : String(v);
  }

  function drawArea(svg, series, spec) {
    var W = svg.clientWidth || (svg.parentNode ? svg.parentNode.clientWidth - 28 : 0);
    if (!W || W < 40) return;
    var H = 120;
    var PAD = { t: 8, r: 6, b: 20, l: 36 };

    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);

    var vals = series.map(function (p) { return p[spec.key]; });
    var lo = Math.min.apply(null, vals);
    var hi = Math.max.apply(null, vals);
    var step = niceStep((hi - lo) || Math.max(1, hi * 0.2));
    var yMin = Math.max(0, Math.floor(lo / step) * step - step);
    var yMax = Math.ceil(hi / step) * step;
    if (yMax === yMin) yMax = yMin + step;

    var plotW = W - PAD.l - PAD.r;
    var plotH = H - PAD.t - PAD.b;
    var X = function (i) { return PAD.l + (i / (series.length - 1)) * plotW; };
    var Y = function (v) { return PAD.t + plotH - ((v - yMin) / (yMax - yMin)) * plotH; };
    var hue = css(spec.hue);

    // solid hairline gridlines, one step off the surface
    for (var t = yMin; t <= yMax + 1e-9; t += step) {
      var gy = Y(t);
      svg.appendChild(el("line", {
        x1: PAD.l, x2: W - PAD.r, y1: gy, y2: gy,
        stroke: css("--tm-gridline"), "stroke-width": 1
      }));
      var tick = el("text", {
        x: PAD.l - 6, y: gy + 3.5, "text-anchor": "end",
        fill: css("--tm-text-muted"), "font-size": 10,
        style: "font-variant-numeric:tabular-nums"
      });
      tick.textContent = fmtTick(t);
      svg.appendChild(tick);
    }

    var line = "";
    for (var i = 0; i < series.length; i++) {
      line += (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(vals[i]).toFixed(1);
    }

    svg.appendChild(el("path", {
      d: line + "L" + X(series.length - 1).toFixed(1) + " " + (PAD.t + plotH) +
         "L" + X(0).toFixed(1) + " " + (PAD.t + plotH) + "Z",
      fill: hue, "fill-opacity": 0.10, stroke: "none"
    }));
    svg.appendChild(el("path", {
      d: line, fill: "none", stroke: hue, "stroke-width": 2,
      "stroke-linejoin": "round", "stroke-linecap": "round"
    }));
    svg.appendChild(el("line", {
      x1: PAD.l, x2: W - PAD.r, y1: PAD.t + plotH, y2: PAD.t + plotH,
      stroke: css("--tm-baseline"), "stroke-width": 1
    }));

    // only the endpoints get x labels, so nothing can collide
    var t0 = el("text", { x: PAD.l, y: H - 6, fill: css("--tm-text-muted"), "font-size": 10 });
    t0.textContent = fmtDate(series[0].t);
    var t1 = el("text", {
      x: W - PAD.r, y: H - 6, "text-anchor": "end",
      fill: css("--tm-text-muted"), "font-size": 10
    });
    t1.textContent = fmtDate(series[series.length - 1].t);
    svg.appendChild(t0);
    svg.appendChild(t1);

    var lastI = series.length - 1;
    svg.appendChild(el("circle", {
      cx: X(lastI), cy: Y(vals[lastI]), r: 4,
      fill: hue, stroke: css("--tm-surface-2"), "stroke-width": 2
    }));

    // hover: crosshair + tooltip, with a full-plot hit area
    var cross = el("line", {
      y1: PAD.t, y2: PAD.t + plotH, stroke: css("--tm-text-muted"),
      "stroke-width": 1, opacity: 0
    });
    var focus = el("circle", {
      r: 4.5, fill: hue, stroke: css("--tm-surface-2"), "stroke-width": 2, opacity: 0
    });
    var hit = el("rect", {
      x: PAD.l, y: PAD.t, width: plotW, height: plotH,
      fill: "transparent", style: "cursor:crosshair"
    });
    svg.appendChild(cross);
    svg.appendChild(focus);
    svg.appendChild(hit);

    hit.addEventListener("pointermove", function (e) {
      var box = svg.getBoundingClientRect();
      var rel = (e.clientX - box.left - PAD.l) / plotW;
      var i = Math.max(0, Math.min(series.length - 1, Math.round(rel * (series.length - 1))));
      cross.setAttribute("x1", X(i));
      cross.setAttribute("x2", X(i));
      cross.setAttribute("opacity", 1);
      focus.setAttribute("cx", X(i));
      focus.setAttribute("cy", Y(vals[i]));
      focus.setAttribute("opacity", 1);
      showTip(e, [muted(fmtDate(series[i].t)), BR,
        spec.name + " ", bold(vals[i].toFixed(spec.dec)), " " + spec.unit]);
    });
    hit.addEventListener("pointerleave", function () {
      cross.setAttribute("opacity", 0);
      focus.setAttribute("opacity", 0);
      hideTip();
    });
  }

  function buildWanTable(m) {
    if (!$("tm-wan-table")) return;
    var rows = m.wan.series.slice().reverse();
    var has = function (k) { return rows[0][k] !== undefined; };

    var headers = ["Date", "Download (Mbps)"];
    if (has("up")) headers.push("Upload (Mbps)");
    if (has("ping")) headers.push("Latency (ms)");

    fillTable("tm-wan-table", headers, rows.map(function (p) {
      var cells = [fmtDate(p.t), p.down.toFixed(0)];
      if (has("up")) cells.push(p.up.toFixed(1));
      if (has("ping")) cells.push(p.ping.toFixed(1));
      return cells;
    }));
  }

  // ------------------------------------------------------ capacity meters

  function meterHue(pct) {
    if (pct >= 90) return css("--tm-critical");
    if (pct >= 75) return css("--tm-warning");
    return css("--tm-series-1");
  }

  function meter(label, pct, valueText, tipText) {
    var wrap = div("tm-meter");
    var row = div("mrow");
    row.appendChild(spanEl("", label));
    var v = spanEl("mv", valueText);
    row.appendChild(v);

    var track = div("tm-track");
    var fill = div("tm-fill");
    fill.style.width = Math.max(0, Math.min(100, pct)) + "%";
    fill.style.background = meterHue(pct);
    track.appendChild(fill);

    wrap.appendChild(row);
    wrap.appendChild(track);

    track.addEventListener("pointermove", function (e) {
      showTip(e, [label + " ", bold(pct.toFixed(1) + "%"), BR, muted(tipText)]);
    });
    track.addEventListener("pointerleave", hideTip);
    return wrap;
  }

  function renderNodes(m) {
    if (!m.capacity || !m.capacity.nodes.length) return false;
    var host = $("tm-nodes");

    m.capacity.nodes.forEach(function (nd) {
      var card = div("tm-card tm-node");
      var nm = div("nm");
      var b = document.createElement("b");
      b.textContent = nd.name;
      nm.appendChild(b);
      nm.appendChild(spanEl("", "up " + nd.uptime_days + "d"));
      card.appendChild(nm);

      // Meters sit in their own grid so a single-node lab spreads them across
      // the card instead of leaving a tall column of empty space.
      var meters = div("tm-meters");
      meters.appendChild(meter("CPU", nd.cpu_pct, nd.cpu_pct.toFixed(1) + "%",
        nd.cores + " cores allocated"));
      meters.appendChild(meter("Memory", nd.mem_pct,
        nd.mem_used_gb.toFixed(1) + " / " + nd.mem_total_gb + " GB",
        nd.mem_pct.toFixed(1) + "% of installed memory"));
      if (nd.disk_pct !== undefined) {
        meters.appendChild(meter("Storage", nd.disk_pct,
          nd.disk_used_gb.toFixed(0) + " / " + nd.disk_total_gb.toFixed(0) + " GB",
          nd.disk_pct.toFixed(1) + "% of root storage"));
      }
      card.appendChild(meters);
      host.appendChild(card);
    });
    return true;
  }

  // ------------------------------------------------------------ network map

  /* The map ships as static SVG with no numbers in it. This fills in the
   * figures from the same snapshot the charts use, so the diagram cannot
   * drift out of date the way a hand-drawn one does. If the snapshot never
   * arrives the fallback labels stay, and the map still reads correctly -
   * it just says "LXC" instead of "23 LXC".
   */
  function setText(id, text) {
    var n = $(id);
    if (n && text) n.textContent = text;
  }

  function renderMap(m) {
    if (m.fleet) {
      // Totals, not running counts: the map describes what is deployed on the
      // node, while the KPI tile above it reports how much is currently up.
      var lxc = m.fleet.lxc_total !== undefined ? m.fleet.lxc_total : m.fleet.lxc;
      var vm = m.fleet.vm_total !== undefined ? m.fleet.vm_total : m.fleet.vm;
      setText("nm-lxc", lxc + " LXC");
      setText("nm-vm", vm + (vm === 1 ? " VM" : " VMs"));
    }
    if (m.density && m.density.cores) {
      setText("nm-host-sub", "single hypervisor · " + m.density.cores + " cores");
    }

    // Storage tiers are sorted largest first by the publisher, and the two
    // network-attached pools are the ones the map draws.
    if (m.storage && m.storage.tiers) {
      var shared = m.storage.tiers.filter(function (t) { return t.shared; });
      shared.slice(0, 2).forEach(function (t, i) {
        setText("nm-nas" + (i + 1) + "-n", t.name);
        setText("nm-nas" + (i + 1), "ZFS · " + t.total_tb.toFixed(1) + " TB");
      });
    }

    var prom = [];
    if (m.targets) prom.push(m.targets.total + " targets");
    if (m.observability && m.observability.retention) {
      prom.push(m.observability.retention + " retention");
    }
    if (prom.length) setText("nm-prom", prom.join(" · "));

    bindFlowSpeed(m);
  }

  /* Dash speed from measured throughput.
   *
   * Every edge is published in bytes per second, so one scale spans all of
   * them and a busier arrow genuinely moves faster than a quieter one - the
   * comparison across arrows is the point. The span is logarithmic because
   * the real spread is enormous: tens of bytes a second on the log edge
   * against tens of megabytes on storage. Clamped at both ends so an idle
   * edge still drifts and a burst never strobes.
   */
  var FLOW_LO = 1;    // log10 bytes/sec rendered at the slowest dash
  var FLOW_HI = 7.5;  // log10 bytes/sec rendered at the fastest
  /* Floor chosen so the quietest edge still visibly moves: at 7s per dash
   * period it crawled and read as stalled. The ratio to DUR_FAST is what
   * carries the comparison, and 8.6x survives the change. */
  var DUR_SLOW = 3.0;
  var DUR_FAST = 0.35;

  function flowDuration(bps) {
    if (!(bps > 0)) return DUR_SLOW.toFixed(2) + "s";
    var t = (Math.log10(bps) - FLOW_LO) / (FLOW_HI - FLOW_LO);
    t = Math.max(0, Math.min(1, t));
    return (DUR_SLOW - t * (DUR_SLOW - DUR_FAST)).toFixed(2) + "s";
  }

  function bindFlowSpeed(m) {
    var f = m.flows;
    // The custom properties live on the map's own root, not the telemetry
    // root - setting them on the wrong subtree would silently do nothing.
    var mapRoot = $("nm-root");
    if (!f || !mapRoot) return;

    // Only the three instrumented edges. The ingress and camera paths have no
    // exporter behind them, so they keep the fixed speed set in CSS.
    [["--nm-dur-metric", f.metric_bps],
     ["--nm-dur-log", f.log_bps],
     ["--nm-dur-disk", f.disk_bps]].forEach(function (row) {
      if (typeof row[1] === "number") {
        mapRoot.style.setProperty(row[0], flowDuration(row[1]));
      }
    });

    if (typeof f.disk_bps === "number") setText("nm-rate-disk", rate(f.disk_bps));
    if (typeof f.log_bps === "number") setText("nm-rate-log", rate(f.log_bps));
    if (typeof f.metric_bps === "number") {
      setText("nm-rate-metric", "~" + rate(f.metric_bps));
    }

    if (f.hourly) {
      diskNote(f.hourly.disk);
      replayDay(mapRoot, f.hourly);
    }
  }

  /* The caption quotes the datastore range and its peak window. Both come from
   * a snapshot that refreshes every 15 minutes, so they are written here
   * rather than kept in the markup, where they drifted out of date.
   *
   * The peak window is the run of hours holding at or above 70% of the day's
   * maximum, walked outwards from the busiest hour so a window crossing
   * midnight stays contiguous. */
  function diskNote(disk) {
    var el = $("nm-disk-note");
    if (!el || !disk || disk.length !== 24) return;

    var top = 0, i;
    for (i = 1; i < 24; i++) if (disk[i] > disk[top]) top = i;
    if (!(disk[top] > 0)) return;

    var lo = disk[0], hi = disk[0];
    for (i = 1; i < 24; i++) {
      if (disk[i] < lo) lo = disk[i];
      if (disk[i] > hi) hi = disk[i];
    }

    var thr = hi * 0.7, start = top, end = top, prev, next;
    while ((prev = (start + 23) % 24) !== top && disk[prev] >= thr) start = prev;
    while ((next = (end + 1) % 24) !== top && disk[next] >= thr) end = next;

    function hh(h) { return (h < 10 ? "0" : "") + h + ":00"; }

    /* Both ends share the top of the range's unit, so the span reads as one
     * quantity - rate() on its own would pair "674 kB/s" with "5.3 MB/s". */
    var div = 1, unit = " B/s";
    if (hi >= 1e6) { div = 1e6; unit = " MB/s"; }
    else if (hi >= 1e3) { div = 1e3; unit = " kB/s"; }
    var dp = div === 1 ? 0 : (lo / div < 0.1 ? 2 : 1);

    /* A near-flat day clears the threshold almost everywhere, and "peaks
     * 01:00-23:00" says nothing. Past two thirds of the day, drop the clause. */
    var span = (end - start + 24) % 24 + 1;
    var peak = span >= 16 ? "" : " and peaks " + hh(start) + "–" + hh(end);

    el.textContent = " Datastore I/O runs " + (lo / div).toFixed(dp) + "–" +
                     (hi / div).toFixed(dp) + unit + peak + ".";
  }

  /* Replay a day across the map.
   *
   * The static speeds above describe the last fifteen minutes, which hides
   * the thing worth showing: disk throughput swings by roughly 8x between the
   * small hours and midday. This walks the published hour-of-day profile on a
   * loop so the dashes accelerate into the nightly backup window and settle
   * again by morning.
   *
   * Offsets are driven per frame rather than by swapping animation-duration,
   * because changing the duration of a running CSS animation restarts it and
   * the dashes visibly jump. Integrating speed by hand keeps the phase
   * continuous, so acceleration is smooth.
   */
  var DAY_SECONDS = 48;    // one simulated day per loop
  var DASH_PERIOD = 10;   // continuous edges: stroke-dasharray 3 + 7
  var SEQ_PERIOD = 15;    // sequenced edges: stroke-dasharray 3 + 12
  var BACKUP_PERIOD = 16; // backup: stroke-dasharray 10 + 6
  /* Disk swings about 8x across the day, but that is under one decade on a
   * scale spanning six and a half, so unamplified it reads as barely moving.
   * Deviation from each edge's own daily mean is raised to this power before
   * mapping, which makes the backup window visible while leaving the mean -
   * and therefore the ordering between edges - where the measurement puts it.
   * The figure caption states that the daily swing is exaggerated. */
  var REPLAY_GAIN = 3.2;
  /* Sequenced edges: each fires in turn, then stops. STAGGER is how far apart
   * in the cycle consecutive edges start, WIDTH how long one stays lit, and
   * PEAK its dash speed at the moment it fires, in units per second. */
  var SEQ_STAGGER = 0.16;
  var SEQ_WIDTH = 0.30;
  /* Mean of the exp(-2.5t) envelope over its window, as a fraction of peak.
   * Used to size each edge's peak so one firing carries a packet exactly its
   * own length - a shared peak either blurs the short edges or crawls the
   * long ones, since they differ by nearly 10x. */
  var SEQ_ENVELOPE_MEAN = 0.367;
  /* Fraction of its own length a packet covers per firing. Crossing the whole
   * path inside one window reads as a flash on the long scrape curves. */
  var SEQ_TRAVEL = 0.50;

  function replayDay(mapRoot, hourly) {
    var reduce = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    /* Every edge is driven here, not just the measured ones. The handover
     * silences the CSS animation on whatever this touches, so an edge left
     * out would simply stop dead - which is what happened when only the three
     * instrumented flows were listed. Uninstrumented paths get a fixed
     * duration; the publish chain gets a burst envelope instead of a rate,
     * because a timer is not a stream. */
    var groups = [
      { sel: ".f-disk", series: hourly.disk },
      // A monthly job has no daily rhythm to replay, so it is not driven by
      // the hourly profile - it holds a slow fixed rate. Its longer dash is
      // what separates it from datastore traffic, which it shares a hue
      // with, so the offset has to wrap on that pattern's own period.
      { sel: ".f-backup", fixed: 5, period: BACKUP_PERIOD },
      { sel: ".f-log", series: hourly.log },
      { sel: ".f-web", fixed: 2.2 },
      { sel: ".f-video", fixed: 0.7 },
      // Scraping and publishing are periodic jobs, not streams. Each edge
      // sits still, then fires in turn, so a scrape cycle reads as one pass
      // over the targets and the publish chain as a hop-by-hop handoff.
      { sel: ".f-metric", seq: { hours: 2, offset: 0 } },
      { sel: ".f-pub", seq: { hours: 2, offset: 0.48 } }
    ].filter(function (g) {
      return g.fixed || g.seq || (g.series && g.series.length === 24);
    });

    groups.forEach(function (g) {
      g.nodes = [].slice.call(mapRoot.querySelectorAll(g.sel + ".nm-edge"))
        .filter(function (n) { return !n.closest(".nm-key"); });
      g.nodes.forEach(function (n) {
        n.classList.add("nm-driven");
        if (g.seq) n.classList.add("nm-seq");
      });
      g.phase = 0;
      // Sequenced groups advance each edge independently, so phase is
      // per-node rather than shared.
      g.phases = g.nodes.map(function () { return 0; });
      if (g.seq) {
        var window = SEQ_WIDTH * (DAY_SECONDS / 24) * g.seq.hours;
        g.peaks = g.nodes.map(function (n) {
          var len = n.getTotalLength ? n.getTotalLength() : 200;
          return (len * SEQ_TRAVEL) / (SEQ_ENVELOPE_MEAN * window);
        });
      }
      if (g.series) {
        var sum = 0;
        for (var i = 0; i < 24; i++) sum += g.series[i];
        g.mean = sum / 24 || 1;
      }
    });
    groups = groups.filter(function (g) { return g.nodes.length; });
    if (!groups.length) return;

    // Hand over from CSS: the keyframe animation and this cannot both own
    // stroke-dashoffset.
    mapRoot.classList.add("nm-js-flow");

    var clock = $("nm-clock");
    var last = null;
    var elapsed = 0;
    var running = true;

    // Interpolate between neighbouring hours so speed ramps instead of
    // stepping 24 times a loop.
    function rateAt(series, hourFloat) {
      var i = Math.floor(hourFloat) % 24;
      var j = (i + 1) % 24;
      var t = hourFloat - Math.floor(hourFloat);
      return series[i] + (series[j] - series[i]) * t;
    }

    // Same log mapping as flowDuration(), but as units per second so it can be
    // integrated frame by frame. A CSS animation of duration d advances the
    // offset by one dash period per d seconds, so this is the equivalent rate.
    function speed(bps) {
      if (!(bps > 0)) return DASH_PERIOD / DUR_SLOW;
      var t = (Math.log10(bps) - FLOW_LO) / (FLOW_HI - FLOW_LO);
      t = Math.max(0, Math.min(1, t));
      return DASH_PERIOD / (DUR_SLOW - t * (DUR_SLOW - DUR_FAST));
    }

    function frame(now) {
      if (!running) return;
      if (last === null) last = now;
      var dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      elapsed = (elapsed + dt) % DAY_SECONDS;

      var hourFloat = (elapsed / DAY_SECONDS) * 24;
      groups.forEach(function (g) {
        var i;
        if (g.seq) {
          // Position in the cycle, offset so publishing trails scraping
          // instead of firing alongside it.
          var cycle = (hourFloat / g.seq.hours + g.seq.offset) % 1;
          for (i = 0; i < g.nodes.length; i++) {
            var d = cycle - i * SEQ_STAGGER;
            if (d < 0) d += 1;
            // Outside its window an edge is genuinely stopped, not slow.
            var env = d < SEQ_WIDTH ? Math.exp(-(d / SEQ_WIDTH) * 2.5) : 0;
            g.phases[i] += g.peaks[i] * env * dt;
            g.nodes[i].style.strokeDashoffset = -(g.phases[i] % SEQ_PERIOD);
          }
          return;
        }

        var period = g.period || DASH_PERIOD;
        var spd;
        if (g.fixed) {
          spd = period / g.fixed;
        } else {
          var bps = rateAt(g.series, hourFloat);
          // Amplify the departure from this edge's own mean; the mean itself
          // is untouched, so edges keep their measured order relative to
          // each other.
          spd = speed(g.mean * Math.pow(Math.max(bps, 1) / g.mean, REPLAY_GAIN));
        }
        g.phase += spd * dt;
        var off = -(g.phase % period);
        for (i = 0; i < g.nodes.length; i++) {
          g.nodes[i].style.strokeDashoffset = off;
        }
      });

      if (clock) {
        var h = Math.floor(hourFloat);
        clock.textContent = (h < 10 ? "0" : "") + h + ":00";
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // Stop burning frames when the map is off screen.
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !running) {
            running = true;
            last = null;
            requestAnimationFrame(frame);
          } else if (!e.isIntersecting) {
            running = false;
          }
        });
      }, { threshold: 0 }).observe(mapRoot);
    }
  }

  function rate(bps) {
    if (bps >= 1e6) return (bps / 1e6).toFixed(1) + " MB/s";
    if (bps >= 1e3) return (bps / 1e3).toFixed(0) + " kB/s";
    return bps.toFixed(0) + " B/s";
  }

  // ------------------------------------------------------- capacity density

  /* How far the guests are written against the metal.
   *
   * One axis: everything is expressed as a multiple of physical capacity, so
   * CPU and memory share a scale and the 1.0x reference line means the same
   * thing on both.
   *
   * All three layers are one hue, because they are nested subsets of a single
   * quantity - a categorical palette would imply they are independent things.
   * Bar length already carries magnitude, so the alpha steps encode prominence
   * instead: what is actually consumed is brightest, and the aspirational
   * figures recede behind it. That also puts the strongest contrast on the
   * shortest bars, which is exactly where it is needed to stay legible.
   */
  function densityRows(d) {
    var rows = [];
    // Contrast against the surface at these alphas: 4.8:1, 3.4:1, 2.5:1.
    var USED = 1, COMMITTED = 0.78, PROVISIONED = 0.6;
    if (d.cores) {
      rows.push(
        { grp: "CPU", lbl: "In use", mult: d.cpu_used_cores / d.cores, a: USED,
          text: d.cpu_used_cores.toFixed(2) + " cores" },
        { grp: "CPU", lbl: "Committed", mult: d.vcpu_committed / d.cores, a: COMMITTED,
          text: d.vcpu_committed + " vCPU" },
        { grp: "CPU", lbl: "Provisioned", mult: d.vcpu_provisioned / d.cores, a: PROVISIONED,
          text: d.vcpu_provisioned + " vCPU" }
      );
    }
    if (d.mem_phys_gb) {
      rows.push(
        { grp: "Memory", lbl: "In use", mult: d.mem_used_gb / d.mem_phys_gb, a: USED,
          text: d.mem_used_gb.toFixed(1) + " GB" },
        { grp: "Memory", lbl: "Committed", mult: d.mem_committed_gb / d.mem_phys_gb, a: COMMITTED,
          text: d.mem_committed_gb.toFixed(1) + " GB" },
        { grp: "Memory", lbl: "Provisioned", mult: d.mem_provisioned_gb / d.mem_phys_gb, a: PROVISIONED,
          text: d.mem_provisioned_gb.toFixed(1) + " GB" }
      );
    }
    return rows;
  }

  function renderDensity(m) {
    var d = m.density;
    if (!d || (!d.cores && !d.mem_phys_gb)) return false;
    var rows = densityRows(d);
    if (!rows.length) return false;

    var host = $("tm-density");
    var hue = css("--tm-series-1");

    // Scale headroom so the 1.0x line never lands flush against the edge.
    var max = 1;
    rows.forEach(function (r) { if (r.mult > max) max = r.mult; });
    max = max * 1.06;

    var lastGrp = null;
    rows.forEach(function (r) {
      if (r.grp !== lastGrp) {
        var head = div("tm-dgrp");
        head.appendChild(spanEl("g", r.grp));
        head.appendChild(spanEl("k", r.grp === "CPU"
          ? d.cores + " physical cores"
          : d.mem_phys_gb.toFixed(1) + " GB installed"));
        host.appendChild(head);
        lastGrp = r.grp;
      }

      var row = div("tm-bar tm-dbar");
      row.appendChild(div("nm", r.lbl));

      var track = div("trk");
      var fill = div("fl");
      fill.style.width = Math.max(1.5, (r.mult / max) * 100) + "%";
      fill.style.background = hue;
      fill.style.opacity = r.a;
      track.appendChild(fill);

      // The reference line is the semantic anchor: left of it fits in the
      // metal, right of it is oversubscribed.
      var ref = div("ref");
      ref.style.left = (1 / max) * 100 + "%";
      track.appendChild(ref);
      row.appendChild(track);

      row.appendChild(div("vl", r.mult.toFixed(2) + "x"));

      row.addEventListener("pointermove", function (e) {
        showTip(e, [r.grp + " " + r.lbl.toLowerCase() + " ", bold(r.text), BR,
          muted(r.mult.toFixed(2) + "x physical capacity")]);
      });
      row.addEventListener("pointerleave", hideTip);
      host.appendChild(row);
    });

    var note = $("tm-density-note");
    if (note) {
      note.textContent = "1.0x = physical capacity. Committed counts running " +
        "guests; provisioned counts every guest as configured.";
    }
    fillTable("tm-density-tbl", ["Resource", "Layer", "Amount", "x physical"],
      rows.map(function (r) {
        return [r.grp, r.lbl, r.text, r.mult.toFixed(2) + "x"];
      }));
    return true;
  }

  // ------------------------------------------------------- storage tiers

  function renderStorage(m) {
    var s = m.storage;
    if (!s || !s.tiers || !s.tiers.length) return false;
    var host = $("tm-storage");

    var card = div("tm-card");
    var cap = div("cap");
    cap.appendChild(spanEl("n", "Datastores"));
    cap.appendChild(spanEl("v", s.used_tb.toFixed(1) + " / " + s.total_tb.toFixed(1) + " TB"));
    card.appendChild(cap);

    var meters = div("tm-meters");
    s.tiers.forEach(function (t) {
      meters.appendChild(meter(
        t.name + (t.shared ? "" : " (local)"),
        t.pct,
        t.used_tb.toFixed(2) + " / " + t.total_tb.toFixed(2) + " TB",
        (t.shared ? "Network-attached" : "Hypervisor-local") + " datastore"
      ));
    });
    card.appendChild(meters);
    host.appendChild(card);

    fillTable("tm-storage-tbl", ["Datastore", "Backing", "Used", "Capacity", "Full"],
      s.tiers.map(function (t) {
        return [t.name, t.shared ? "Network" : "Local",
                t.used_tb.toFixed(2) + " TB", t.total_tb.toFixed(2) + " TB",
                t.pct.toFixed(1) + "%"];
      }));
    return true;
  }

  // ------------------------------------------------------------- NAS cache

  /* ZFS ARC behaviour and pool-member I/O.
   *
   * Deliberately not capacity - the Storage panel above already reports that,
   * from Proxmox, which is the side that knows what each datastore actually
   * holds. What Proxmox cannot see is whether the pool is working well, and
   * that is the question the hit rate answers: a pool serving nearly every
   * read out of RAM is doing its job.
   *
   * Two cards because the two halves make different claims. The first is a
   * single headline number with the range behind it; the second is a
   * comparison across five devices, where the point is how alike four of
   * them are.
   */
  function renderNas(m) {
    var n = m.nas;
    if (!n || !n.arc) return false;
    var a = n.arc;
    var host = $("tm-nas");
    // Without this the whole boot chain throws here and every panel after
    // this one goes missing, rather than just this one.
    if (!host) return false;

    // --- cache card
    var card = div("tm-card");
    var cap = div("cap");
    cap.appendChild(spanEl("n", n.name ? n.name + " · ARC" : "ARC"));
    cap.appendChild(spanEl("v", a.hit_pct.toFixed(1) + "% hit"));
    card.appendChild(cap);

    var figs = div("tm-figs");
    if (a.hit_mean_pct !== undefined) {
      figs.appendChild(fig(a.hit_mean_pct.toFixed(1) + "%", "mean hit rate",
        a.hit_min_pct !== undefined
          ? "worst hour " + a.hit_min_pct.toFixed(1) + "%" : ""));
    }
    if (a.size_gib !== undefined && a.max_gib) {
      figs.appendChild(fig(a.size_gib.toFixed(1) + " GiB", "cache resident",
        "ceiling " + a.max_gib.toFixed(1) + " GiB"));
    }
    if (n.uptime_days !== undefined) {
      figs.appendChild(fig(Math.round(n.uptime_days) + "d", "uptime",
        n.load1 !== undefined ? "load " + n.load1.toFixed(2) : ""));
    }
    card.appendChild(figs);

    if (a.size_gib !== undefined && a.max_gib) {
      var pct = a.size_gib / a.max_gib * 100;
      var mt = meter("Cache against its ceiling", pct,
        a.size_gib.toFixed(1) + " / " + a.max_gib.toFixed(1) + " GiB",
        "ARC grows into free memory and gives it back under pressure");
      // The 14-day high-water mark, so a cache sitting well under its
      // ceiling right now still shows how far it has actually stretched.
      if (a.peak_gib) {
        var ref = div("tm-refmark");
        ref.style.left = Math.min(100, a.peak_gib / a.max_gib * 100) + "%";
        ref.title = "14-day peak " + a.peak_gib.toFixed(1) + " GiB";
        mt.querySelector(".tm-track").appendChild(ref);
      }
      card.appendChild(mt);
    }

    /* What the cache is holding. ZFS splits the ARC into two lists: blocks it
     * has served more than once (MFU) and blocks it has served once so far
     * (MRU). An MFU-dominated cache means the working set is warm and stable
     * rather than being churned by one-off reads.
     *
     * Labelled in plain terms, with the ZFS names in the tooltip - "frequently
     * used" and "recently used" are the upstream words and they say nothing to
     * anyone who has not read the ARC documentation. */
    if (a.frequent_pct !== undefined && a.recent_pct !== undefined) {
      var split = div("tm-split");
      [["--tm-series-1", a.frequent_pct, "MFU", "served more than once"],
       ["--tm-series-4", a.recent_pct, "MRU", "served once so far"]].forEach(function (s) {
        var seg = document.createElement("i");
        seg.style.width = s[1] + "%";
        seg.style.background = css(s[0]);
        seg.title = s[2] + " — cached blocks " + s[3] + " · " + s[1].toFixed(1) + "%";
        split.appendChild(seg);
      });
      card.appendChild(split);
      var sl = div("tm-splitlbl");
      sl.appendChild(spanEl("", a.frequent_pct.toFixed(0) + "% read more than once"));
      sl.appendChild(spanEl("r", a.recent_pct.toFixed(0) + "% read once"));
      card.appendChild(sl);
    }
    host.appendChild(card);

    // --- pool members card
    if (n.disks && n.disks.length) {
      var dcard = div("tm-card");
      var dcap = div("cap");
      dcap.appendChild(spanEl("n", "Pool members"));
      dcap.appendChild(spanEl("v", n.disks.length + " devices"));
      dcard.appendChild(dcap);

      var max = 0;
      n.disks.forEach(function (d) {
        max = Math.max(max, (d.write_kbs || 0) + (d.read_kbs || 0));
      });
      max = max || 1;

      var rows = div("tm-drows");
      n.disks.forEach(function (d) {
        var w = d.write_kbs || 0, r = d.read_kbs || 0;
        rows.appendChild(div("dn", d.name));
        var track = div("tm-dtrack");
        [["--tm-series-1", w, "write"], ["--tm-series-2", r, "read"]].forEach(function (s) {
          if (!s[1]) return;
          var seg = document.createElement("i");
          seg.style.width = (s[1] / max * 100) + "%";
          seg.style.background = css(s[0]);
          seg.addEventListener("pointermove", function (e) {
            showTip(e, [bold(d.name), BR, muted("24h mean " + s[2]),
              " " + s[1].toFixed(1) + " KiB/s"]);
          });
          seg.addEventListener("pointerleave", hideTip);
          track.appendChild(seg);
        });
        rows.appendChild(track);
        rows.appendChild(div("dv", Math.round(w + r) + " KiB/s"));
      });
      dcard.appendChild(rows);

      // Same swatch/group structure the downtime legend uses, so it picks up
      // the existing .tm-legend rules rather than needing its own.
      var leg = div("tm-legend");
      leg.appendChild(spanEl("", "24-hour mean:"));
      [["--tm-series-1", "write"], ["--tm-series-2", "read"]].forEach(function (s) {
        var g = div("grp");
        var sw = div("sw");
        sw.style.background = css(s[0]);
        g.appendChild(sw);
        g.appendChild(spanEl("", s[1]));
        leg.appendChild(g);
      });
      dcard.appendChild(leg);
      host.appendChild(dcard);

      fillTable("tm-nas-tbl", ["Device", "Write", "Read", "Total"],
        n.disks.map(function (d) {
          var w = d.write_kbs || 0, r = d.read_kbs || 0;
          return [d.name, w.toFixed(1) + " KiB/s", r.toFixed(1) + " KiB/s",
                  (w + r).toFixed(1) + " KiB/s"];
        }));
    }

    setText("tm-nas-note", "ZFS ARC over " + m.window_days +
      " days; per-device I/O is a 24-hour mean.");
    return true;
  }

  function fig(value, label, sub) {
    var f = div("tm-fig");
    f.appendChild(div("fv", value));
    f.appendChild(div("fl", label));
    if (sub) f.appendChild(div("fs", sub));
    return f;
  }

  // ------------------------------------------------ 24-hour rhythm columns

  var RHYTHM_SPECS = [
    { key: "cpu_pct",       name: "Node CPU",    unit: "%",    hue: "--tm-series-1", dec: 1 },
    { key: "net_rx_mbs",    name: "Guest net in", unit: "MB/s", hue: "--tm-series-3", dec: 2 },
    { key: "disk_read_mbs", name: "Guest disk read", unit: "MB/s", hue: "--tm-series-2", dec: 2 }
  ];

  /* Columns rather than an area: these are 24 discrete hour buckets averaged
   * over the window, not a continuous trace. Three small multiples rather
   * than one chart because the units differ - a second y-axis is never the
   * answer. Only the peak hour is direct-labelled. */
  function renderRhythm(m) {
    var r = m.rhythm;
    if (!r) return false;
    var specs = RHYTHM_SPECS.filter(function (s) {
      return Array.isArray(r[s.key]) && r[s.key].length === 24;
    });
    if (!specs.length) return false;

    var host = $("tm-rhythm");
    specs.forEach(function (spec) {
      var vals = r[spec.key];
      var max = Math.max.apply(null, vals) || 1;
      var peak = vals.indexOf(max);
      var hue = css(spec.hue);

      var card = div("tm-card");
      var cap = div("cap");
      cap.appendChild(spanEl("n", spec.name));
      cap.appendChild(spanEl("v", "peak " + pad2(peak) + ":00"));
      card.appendChild(cap);

      var cols = div("tm-cols");
      vals.forEach(function (v, h) {
        var slot = div("tm-col");
        var bar = document.createElement("i");
        // 3% floor so an empty hour still reads as a bar rather than a gap.
        bar.style.height = Math.max(3, (v / max) * 100) + "%";
        bar.style.background = hue;
        if (h !== peak) bar.style.opacity = "0.55";
        slot.appendChild(bar);
        slot.addEventListener("pointermove", function (e) {
          showTip(e, [pad2(h) + ":00 " + (r.tz || ""), BR,
            bold(v.toFixed(spec.dec) + " " + spec.unit)]);
        });
        slot.addEventListener("pointerleave", hideTip);
        cols.appendChild(slot);
      });
      card.appendChild(cols);

      var ax = div("tm-hax");
      ["00", "06", "12", "18", "23"].forEach(function (t) {
        ax.appendChild(spanEl("", t));
      });
      card.appendChild(ax);
      host.appendChild(card);
    });

    var note = $("tm-rhythm-note");
    if (note) {
      note.textContent = "Mean by hour, last " + m.window_days + " days, " +
        (r.tz || "server time") + ". Peak highlighted.";
    }

    fillTable("tm-rhythm-tbl",
      ["Hour"].concat(specs.map(function (s) { return s.name + " (" + s.unit + ")"; })),
      Array.apply(null, Array(24)).map(function (_, h) {
        return [pad2(h) + ":00"].concat(specs.map(function (s) {
          return r[s.key][h].toFixed(s.dec);
        }));
      }));
    return true;
  }

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  // --------------------------------------------------------- horizontal bars

  /* Shared bar renderer. Bars are 14px with a 4px rounded data-end and a
   * square baseline, and every value is direct-labelled at the tip - with
   * this few rows there is no reason to make anyone hover to read one. */
  function renderBars(host, rows, opts) {
    var max = 0;
    rows.forEach(function (r) { if (r.value > max) max = r.value; });
    if (!max) return;

    rows.forEach(function (r) {
      var row = div("tm-bar");
      var nm = div("nm", r.name);
      nm.title = r.name;

      var track = div("trk");
      var fill = div("fl");
      // Floor the width so the shortest bar is still visibly a bar.
      fill.style.width = Math.max(1.5, (r.value / max) * 100) + "%";
      fill.style.background = r.color;
      track.appendChild(fill);

      row.appendChild(nm);
      row.appendChild(track);
      row.appendChild(div("vl", r.text));

      if (opts && opts.tip) {
        row.addEventListener("pointermove", function (e) { showTip(e, opts.tip(r)); });
        row.addEventListener("pointerleave", hideTip);
      }
      host.appendChild(row);
    });
  }

  // TLS expiry has real operational thresholds, so status colour is what the
  // number means - not a decorative ramp. The label carries it either way.
  function certHue(days) {
    if (days <= 14) return css("--tm-critical");
    if (days <= 30) return css("--tm-warning");
    return css("--tm-good");
  }

  function renderCerts(m) {
    if (!m.certs || !m.certs.length) return false;

    renderBars($("tm-certs"), m.certs.map(function (c) {
      return {
        name: c.name,
        value: Math.max(0, c.days),
        text: c.days + " d",
        color: c.valid ? certHue(c.days) : css("--tm-critical")
      };
    }), {
      tip: function (r) {
        return [bold(r.name), BR, muted("certificate expires in"), " " + r.text];
      }
    });

    var lg = $("tm-certs-legend");
    [["--tm-critical", "14 days or less"],
     ["--tm-warning", "30 days or less"],
     ["--tm-good", "healthy"]].forEach(function (pair) {
      var g = div("grp");
      var sw = div("sw");
      sw.style.background = css(pair[0]);
      g.appendChild(sw);
      g.appendChild(spanEl("", pair[1]));
      lg.appendChild(g);
    });
    return true;
  }

  // Response time is a nominal list, so every bar takes the same hue - making
  // it darker-where-bigger would just re-encode the length as colour.
  function renderResponse(m) {
    if (!m.response || !m.response.length) return false;

    renderBars($("tm-resp"), m.response.map(function (r) {
      return {
        name: r.name,
        value: r.ms,
        text: r.ms < 10 ? r.ms.toFixed(1) + " ms" : Math.round(r.ms) + " ms",
        color: css("--tm-series-1")
      };
    }), {
      tip: function (r) {
        return [bold(r.name), BR, muted("median over " + m.window_days + " days"),
          " " + r.text];
      }
    });

    fillTable("tm-resp-table", ["Service", "Median response"],
      m.response.map(function (r) { return [r.name, r.ms + " ms"]; }));
    return true;
  }

  // ------------------------------------------------------ downtime heatmap

  var HEAT_BINS = [
    { max: 0,        fill: "#232426", lbl: "none" },
    { max: 5,        fill: "#5c2b2b", lbl: "<5m" },
    { max: 30,       fill: "#8f3535", lbl: "<30m" },
    { max: 120,      fill: "#c0403f", lbl: "<2h" },
    { max: Infinity, fill: "#e66767", lbl: "2h+" }
  ];

  function heatFill(min) {
    for (var i = 0; i < HEAT_BINS.length; i++) {
      if (min <= HEAT_BINS[i].max) return HEAT_BINS[i].fill;
    }
    return HEAT_BINS[HEAT_BINS.length - 1].fill;
  }

  function renderHeat(m) {
    if (!m.services || !m.services.length) return false;
    var host = $("tm-heat");

    m.services.forEach(function (svc) {
      var rl = div("rl", svc.name);
      rl.title = svc.name;
      var cells = div("tm-cells");
      cells.style.gridTemplateColumns = "repeat(" + svc.days.length + ", minmax(0, 1fr))";

      svc.days.forEach(function (mins, i) {
        var c = div("tm-cell");
        c.style.background = heatFill(mins);
        var ts = m.generated - (svc.days.length - 1 - i) * 86400;
        c.addEventListener("pointermove", function (e) {
          showTip(e, [bold(svc.name), BR, muted(fmtDate(ts)), " · " +
            (mins === 0 ? "no downtime" : mins + " min down")]);
        });
        c.addEventListener("pointerleave", hideTip);
        cells.appendChild(c);
      });

      host.appendChild(rl);
      host.appendChild(cells);
    });

    // a binned scale always ships its legend
    var lg = $("tm-heat-legend");
    lg.appendChild(spanEl("", "Downtime per day:"));
    HEAT_BINS.forEach(function (b) {
      var g = div("grp");
      var sw = div("sw");
      sw.style.background = b.fill;
      g.appendChild(sw);
      g.appendChild(spanEl("", b.lbl));
      lg.appendChild(g);
    });
    var range = spanEl("", fmtDate(m.generated - (m.window_days - 1) * 86400) +
      " → " + fmtDate(m.generated));
    range.style.marginLeft = "auto";
    lg.appendChild(range);

    fillTable("tm-heat-table", ["Service", "Uptime", "Total downtime", "Worst day"],
      m.services.map(function (s) {
        var worst = Math.max.apply(null, s.days);
        return [s.name, s.uptime_pct.toFixed(3) + "%", s.downtime_min + " min",
                worst ? worst + " min" : "\u2014"];
      }));
    return true;
  }

  // ------------------------------------------------------------ table toggles

  function wireToggles() {
    var buttons = root.querySelectorAll(".tm-toggle");
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function () {
        var target = $(btn.getAttribute("data-target"));
        if (!target) return;
        var open = !target.hasAttribute("hidden");
        if (open) {
          target.setAttribute("hidden", "");
          btn.textContent = "Table view";
          btn.setAttribute("aria-expanded", "false");
        } else {
          target.removeAttribute("hidden");
          btn.textContent = "Hide table";
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  // ---------------------------------------------------------- AWS map

  /* Traces a real page load across the AWS diagram.
   *
   * Nothing here is on a timer: each leg animates when the request it stands
   * for actually happened, with durations taken from the browser's own
   * Navigation and Resource Timing entries. A leg the browser cannot observe
   * - the CloudFront-to-S3 origin fetch, which is invisible cross-origin -
   * animates without claiming a number.
   *
   * Everything read here describes this visitor's own connection and never
   * leaves the page. No address, no identifier, no third-party call.
   */
  function initAwsMap() {
    var awRoot = document.getElementById("aw-root");
    if (!awRoot) return;

    var reduce = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !window.Element || !Element.prototype.animate) {
      // Leave every edge drawn and solid; the labels still carry the order.
      awRoot.classList.add("aw-static");
      return;
    }

    function setPanel(id, text) {
      var n = document.getElementById(id);
      if (n && text) n.textContent = text;
    }

    function ms(v) {
      if (!(v > 0)) return null;
      return v < 10 ? v.toFixed(1) + " ms" : Math.round(v) + " ms";
    }

    function bytes(v) {
      if (!(v > 0)) return null;
      return v >= 1048576 ? (v / 1048576).toFixed(1) + " MB"
                          : Math.round(v / 1024) + " kB";
    }

    /* Floor so a two-millisecond request still reads. */
    /* Speed ceiling in user units per ms. Duration otherwise comes only from
     * request time, so the 808-unit DynamoDB return crossed at several times
     * the pace of a 50-unit leg. Lower is slower; 0.42 puts that leg at about
     * 1.9s and the telemetry leg at 1.2s, while every short leg stays on the
     * 420ms floor and is unaffected. */
    var MAX_LEG_SPEED = 0.42;

    function legLength(step) {
      var el = awRoot.querySelector(".s" + step);
      return el && el.getTotalLength ? el.getTotalLength() : 200;
    }

    function legDuration(t, len) {
      var d = Math.max(420, Math.min(2000, (t || 0) * 5 + 420));
      return len ? Math.max(d, len / MAX_LEG_SPEED) : d;
    }

    function fire(step, t) {
      var el = awRoot.querySelector(".s" + step);
      if (!el) return legDuration(t);
      var len = el.getTotalLength ? el.getTotalLength() : 200;
      var dur = legDuration(t, len);

      /* Travel the leg plus a dash period so the pattern clears the far end.
       * Decreasing offset advances along the path; legs are authored
       * source-first, so this runs with the flow. */
      var travel = len + 12;
      el.animate([
        { strokeDashoffset: "0", opacity: 0.18 },
        { strokeDashoffset: (-travel * 0.08) + "", opacity: 1, offset: 0.08 },
        { strokeDashoffset: (-travel * 0.9) + "", opacity: 1, offset: 0.9 },
        { strokeDashoffset: (-travel) + "", opacity: 0.18 }
      ], { duration: dur, easing: "linear", fill: "both" });
      return dur;
    }

    // Legs run back to back rather than all at once, so the eye follows one
    // request through the system.
    function run(legs) {
      var at = 0;
      legs.forEach(function (leg) {
        var delay = at;
        setTimeout(function () { fire(leg[0], leg[1]); }, delay);
        at += legDuration(leg[1], legLength(leg[0])) * 0.45;
      });
    }

    var nav = null;
    try {
      nav = performance.getEntriesByType("navigation")[0] || null;
    } catch (err) {
      nav = null;
    }

    function staticLegs() {
      if (!nav) return [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]];
      var dns = nav.domainLookupEnd - nav.domainLookupStart;
      var tls = nav.connectEnd - nav.connectStart;
      var wait = nav.responseStart - nav.requestStart;
      var xfer = nav.responseEnd - nav.responseStart;
      // Query and answer split the lookup; the origin legs get the wait time
      // they plausibly sit inside but are never labelled with it.
      return [
        [1, dns / 2], [2, dns / 2],
        [3, tls + wait * 0.4],
        [4, wait * 0.3], [5, wait * 0.3],
        [6, xfer]
      ];
    }

    if (nav) {
      setPanel("aw-t-dns", ms(nav.domainLookupEnd - nav.domainLookupStart) || "cached");
      setPanel("aw-t-req", ms((nav.connectEnd - nav.connectStart) +
        (nav.responseStart - nav.requestStart)));
      setPanel("aw-t-res", ms(nav.responseEnd - nav.responseStart));
      setPanel("aw-t-proto", nav.nextHopProtocol || null);
      // transferSize of 0 with a real body means it came from the local cache.
      var sent = nav.transferSize;
      var body = nav.decodedBodySize;
      if (sent === 0 && body > 0) {
        setPanel("aw-t-bytes", "browser cache");
        setPanel("aw-t-decoded", bytes(body));
      } else if (bytes(sent)) {
        // Two rows rather than one sentence: the prose form wrapped inside a
        // grid cell, and these are two numbers, not a phrase.
        setPanel("aw-t-bytes", bytes(sent));
        if (body > sent) setPanel("aw-t-decoded", bytes(body));
      }
    }

    // The public endpoints this page actually talks to, read back from the
    // requests it made. All of them are already visible in any visitor's
    // network tab - this only surfaces what the page is doing anyway.
    function showEndpoints() {
      var hosts = {};
      try {
        performance.getEntriesByType("resource").forEach(function (e) {
          var m = /^https?:\/\/([^/]+)/.exec(e.name);
          if (m) hosts[m[1]] = true;
        });
      } catch (err) { return; }
      var mine = /(^|\.)(gregchow\.net|amazonaws\.com|cloudfront\.net)$/;
      var list = Object.keys(hosts).filter(function (h) { return mine.test(h); });
      // Only add the page's own host when it really is this site - under a
      // preview or a proxy it is someone else's domain and means nothing.
      if (location && location.host && mine.test(location.host)) {
        list.unshift(location.host);
      }
      if (!list.length) return;
      // All of them now, not just the first: the readout is HTML and wraps,
      // where the old in-diagram panel could fit one truncated hostname.
      setPanel("aw-t-ep", list.slice(0, 4).join(" \u00b7 "));
    }

    // Resource entries arrive as the page's own requests complete. buffered
    // picks up any that finished before this ran.
    function watch() {
      try {
        var po = new PerformanceObserver(function (list) {
          list.getEntries().forEach(function (e) {
            if (/execute-api|amazonaws\.com\/[a-z]*[Ss]tage/.test(e.name)) {
              apiMs = e.duration;
              setPanel("aw-t-api", ms(e.duration));
            } else if (/metrics\.json/.test(e.name)) {
              telMs = e.duration;
              setPanel("aw-t-tel", ms(e.duration));
            }
          });
        });
        po.observe({ type: "resource", buffered: true });
      } catch (err) {
        // No PerformanceObserver: the static path still traces on view.
      }
    }

    var started = false;
    var apiMs = 0;
    var telMs = 0;
    var timer = null;
    var pubTimer = null;

    // One full pass: the static path, then the two dynamic paths. Repeated on
    // a loop because the page only makes these requests once - the durations
    // stay the real measured ones, so the replay never invents a number.
    function trace() {
      var legs = staticLegs();
      run(legs);
      var after = 0;
      legs.forEach(function (l) { after += legDuration(l[1], legLength(l[0])) * 0.45; });
      setTimeout(function () {
        run([[7, apiMs / 3], [8, apiMs / 3], [9, apiMs / 3], [10, apiMs / 3]]);
      }, after);
      // Only the browser's pull of metrics.json belongs to a page load. The
      // homelab's PUT is a background job on its own 15-minute timer and is
      // driven separately below.
      setTimeout(function () {
        run([[12, telMs]]);
      }, after + 500);
    }

    // The publisher's upload, on its own slow cycle - deliberately unrelated
    // to the page-load trace, because that is how it really runs.
    function publishPulse() {
      fire(11, 260);
    }

    function start() {
      if (started) return;
      started = true;
      watch();
      showEndpoints();
      trace();
      timer = setInterval(trace, 5000);
      publishPulse();
      pubTimer = setInterval(publishPulse, 11000);
    }

    // Hold the trace until the diagram is actually on screen, otherwise the
    // whole thing plays to nobody while the reader is still at the top.
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            start();
            if (!timer) timer = setInterval(trace, 5000);
            if (!pubTimer) pubTimer = setInterval(publishPulse, 11000);
          } else if (timer) {
            clearInterval(timer);
            clearInterval(pubTimer);
            timer = null;
            pubTimer = null;
          }
        });
      }, { threshold: 0.2 }).observe(awRoot);
    } else {
      start();
    }
  }

  // ------------------------------------------------------------------- boot

  initAwsMap();

  fetch(METRICS_URL, { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("metrics fetch failed: " + r.status);
      return r.json();
    })
    .then(function (m) {
      // The map lives outside #tm-root and is always visible, so it is
      // filled in first and independently of whether any panel draws.
      renderMap(m);

      var drew = false;
      if (renderKpi(m)) { show("tm-kpi"); show("tm-head"); drew = true; }
      if (renderWan(m)) { show("tm-sec-wan"); drew = true; }
      if (renderDensity(m)) { show("tm-sec-density"); drew = true; }
      if (renderRhythm(m)) { show("tm-sec-rhythm"); drew = true; }
      if (renderStorage(m)) { show("tm-sec-storage"); drew = true; }
      if (renderNas(m)) { show("tm-sec-nas"); drew = true; }
      if (renderNodes(m)) { show("tm-sec-nodes"); drew = true; }
      if (renderResponse(m)) { show("tm-sec-resp"); drew = true; }
      if (renderHeat(m)) { show("tm-sec-heat"); drew = true; }
      if (renderCerts(m)) { show("tm-sec-certs"); drew = true; }

      // Nothing renderable is the same as nothing to show - stay hidden
      // rather than leaving an empty frame on the page.
      if (drew) {
        root.removeAttribute("hidden");
        wireToggles();
      }
    })
    .catch(function (err) {
      // A homelab that is off, or an expired snapshot, must never break the
      // rest of the page - the section simply stays hidden.
      if (window.console) console.warn("telemetry unavailable:", err.message);
    });
})();
