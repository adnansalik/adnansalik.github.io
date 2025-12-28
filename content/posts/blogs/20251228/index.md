+++
title = 'How I Revived My 8yr Old Machine'
date = '2025-12-28T16:31:00+05:30'
draft = false
tags = ['tech','linux','nvidia','dell']
summary = 'How I revived my 8 year old machine using Linux debugging'

[params]
  layout = "wide"
+++

### Background (Story Time!)
Before joining university I had the privilage to choose my own laptop and I ended up buying the [Dell Inspiron 7560](https://www.dell.com/support/product-details/en-in/product/inspiron-15-7560-laptop/drivers), at the time it had a power efficient i7 7200U and and dGPU NVIDIA Geforce 940MX and a decent enough battery.

It served me well with gaming and development related stuff, it was in this laptop where I first installed Linux Ubuntu and explored the amazing world of linux ricing and went on a an adventure of distro hopping from most resource intensive to very lightweight ones.

I had dual booted my PC to play games since Wine did not work that well with my GPU so had to rely on Windows.

#### One fine day (Doomsday)
I forgot to shutdown or put my PC to sleep and left it in my room on the blanket where it was running some GPU heavy game. Big mistake.

By the time I returned I saw my laptop screen flikering and overheated to the max, I'm sure it was the most hot I have ever touched a surface of a laptop. I immediately killed it and waited for it to cool.

Once cooled down I booted the machine and found nothing out of the ordinary, thank god I thought. I was wrong.

### What went wrong (The aftermath)
The first sign of trouble was when my system started hanging during the boot sequence. On a standard Windows install, you just get a spinning circle or a Blue Screen; on Linux, I could drop into the TTY and see the kernel never booting the user interface due to being in a perpetual TTY state.

### The Diagnosis (Detective at work)
I googled a lot over the years on Windows over what might be worng but never got nudged in the right direction or was lost in a limbo chasing for answers which I found never worked. I gave up for years. I finally decided to install Linux since I wanted a machine where I can write blogs and did not want to use my other machines.

I finally installed Debian 13 and started the analysis, here is what I did:

#### #1 GPU - The Victim
```
    # To check for GPU error messages
        sudo dmesg | grep -iE "nouveau|nvidia|pci" | grep -i "error"
    # It gave a response of
        NVRM: loading NVIDIA UNIX x86_64 Kernel Module  550.163.01  Tue Apr  8 12:41:17 UTC 2025
        NVRM: GPU at PCI:0000:01:00: GPU-f1648d72-c7c8-9814-2832-7a062b009188
        NVRM: GPU at PCI:0000:01:00: GPU-f1648d72-c7c8-9814-2832-7a062b009188
        NVRM: Xid (PCI:0000:01:00): 79, pid='<unknown>', name=<unknown>, GPU has fallen off the bus.
        NVRM: GPU 0000:01:00.0: GPU has fallen off the bus.
        NVRM: A GPU crash dump has been created. If possible, please run
        NVRM: nvidia-bug-report.sh as root to collect this data before
        NVRM: the NVIDIA kernel module is unloaded.

```
>This shows the kernel trying to wake up the 940MX and the chip basically refusing to respond, stuck in a low-power D3 state but still "visible" enough to cause errors.
___

#### #2 HDD - The Hidden Victim
The heat didn't just break the GPU; it physically damaged the mechanical HDD
```
    # To check for HDD health
        sudo smartctl -A /dev/sda

    ID# ATTRIBUTE_NAME          FLAG     VALUE WORST THRESH TYPE      UPDATED  RAW_VALUE
    1   Raw_Read_Error_Rate     0x000f   081   064   006    Pre-fail  Always   128690498
    5   Reallocated_Sector_Ct   0x0033   099   099   036    Pre-fail  Always   611
    193 Load_Cycle_Count        0x0032   004   004   000    Old_age   Always   193424

```
> Seeing a 611 in the RAW_VALUE for Reallocated_Sector_Ct meant there are 611 tiny physical locations on my disk which are dead and the drive's firmware had to move that data to a "spare" area.

### The Solution (Surgery)
Since I couldn't re-solder the GPU, I decided to "amputate" it software-side to save the rest of the machine.
1. Detaching the GPU

    I modified the GRUB configuration to tell the Linux kernel to ignore the NVIDIA chip entirely. By blacklisting the nouveau and nvidia drivers, the OS stopped trying to "talk" to the broken hardware. The result? The GPU temperature dropped to 36.0°C colder than the CPU, meaning it was finally powered down and no longer draining the battery. 

Here is the GRUB config line I used:
```
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash fastboot rootdelay=0 modprobe.blacklist=nvidia,nvidia-drm,nvidia-modeset,nvidia-uvm,nouveau"
```

2. Lean OS Configuration

    Optimised certain processes using `systemd-analyze` to reduce boot times and unmounted HDD to only use when necessary. My machine ran on SSD so it was no problem to isolate the HDD.

### The Results
I have a fast enough machine on which I am writing blogs and the GPU is idle and not drawing any power. My PC can boot from sleep, it is a joy seeing it do that.

- The Fan stopped screaming: Because the GPU was truly off and the HDD wasn't constantly seeking.
- The Battery Life improved
- Screen tearing stuttering stopped

### Closing Thoughts
I learnt that if a single component goes kaput, it doesn't mean the whole machine is trash. Linux can reconfigure the hardware.
If you have an old laptop gathering dust because it feels "broken," don't bin it. Boot into a live USB, run `dmesg` and `sensors`, and see what’s actually happening under the hood. You might find that your "e-waste" is actually just a few configuration lines away from a second life.

<img src="ff.png" alt="linux-machine" style="display:block; margin-left:auto; margin-right:auto; width:100%;" />