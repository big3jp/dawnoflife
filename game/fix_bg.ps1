Add-Type -AssemblyName System.Drawing
$files = Get-ChildItem -Path "d:\gravity\game\assets\*.png"

foreach ($file in $files) {
    if ($file.Name -match "^bg_") { continue }
    try {
        $bmp = New-Object System.Drawing.Bitmap($file.FullName)
        
        # Lock bits to edit pixels faster (or just loop)
        $rect = New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, $bmp.Height)
        $bmpData = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadWrite, $bmp.PixelFormat)
        
        $bytes = [Math]::Abs($bmpData.Stride) * $bmp.Height
        $rgbValues = New-Object byte[] $bytes
        [System.Runtime.InteropServices.Marshal]::Copy($bmpData.Scan0, $rgbValues, 0, $bytes)
        
        # Get background pixel from (0,0)
        # Pixel format is likely Format32bppArgb or Format24bppRgb
        $pixelBytes = 4
        if ($bmp.PixelFormat -eq [System.Drawing.Imaging.PixelFormat]::Format24bppRgb) { $pixelBytes = 3 }
        
        # Assume background from top-left
        $bBg = $rgbValues[0]
        $gBg = $rgbValues[1]
        $rBg = $rgbValues[2]
        
        $pixelsChanged = 0
        for ($i = 0; $i -lt $rgbValues.Length; $i += $pixelBytes) {
            $b = $rgbValues[$i]
            $g = $rgbValues[$i+1]
            $r = $rgbValues[$i+2]
            
            # distance from background
            $dist = [Math]::Sqrt([Math]::Pow($r - $rBg, 2) + [Math]::Pow($g - $gBg, 2) + [Math]::Pow($b - $bBg, 2))
            
            # Simple threshold matching to account for anti-aliasing
            if ($dist -lt 50 -and $pixelBytes -eq 4) {
                # Update alpha (A)
                $aIndex = $i + 3
                # Smooth alpha transition
                $newA = 0
                if ($dist -gt 20) {
                    $newA = [Convert]::ToByte((($dist - 20) / 30.0) * 255)
                }
                $rgbValues[$aIndex] = $newA
                $pixelsChanged++
            }
        }
        
        if ($pixelBytes -eq 4 -and $pixelsChanged -gt 0) {
            [System.Runtime.InteropServices.Marshal]::Copy($rgbValues, 0, $bmpData.Scan0, $bytes)
        }
        $bmp.UnlockBits($bmpData)
        
        if ($pixelBytes -eq 3) {
            # For 24bpp, just do simple make transparent
            $bgCol = $bmp.GetPixel(0,0)
            $bmp.MakeTransparent($bgCol)
        }

        $tempPath = $file.FullName + ".tmp.png"
        $bmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmp.Dispose()
        
        Move-Item -Path $tempPath -Destination $file.FullName -Force
        Write-Host "Processed $($file.Name) (made transparent)"
    } catch {
        Write-Host "Failed $($file.Name): $_"
    }
}
