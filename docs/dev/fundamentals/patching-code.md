---
prev: true
next: true
description: Learn about patching game code using Harmony to modify Crawlspace 2's behavior.
---

# Patching Code

## Introduction

When modding Crawlspace 2, you'll often need to modify the game's original code. This is done through **Harmony**, a powerful library that allows you to:
- **Replace and modify** original methods
- **Run your code before and/or after** the original methods
- **Access and manipulate** game state and variables

Harmony is included with BepInEx and is the standard tool for patching in Crawlspace 2 mods.

:::info NOTE
In this guide, we use "patching" and "hooking" to refer to the act of running our code before and after the original method, or directly modifying the original method.
:::

## How Harmony Works

Harmony uses C# attributes to identify which methods you want to patch. You specify:
1. The target class and method you want to patch
2. When your code should run (before, after, or instead of the original)
3. What parameters you need access to

Your patch methods must follow specific naming conventions for Harmony to recognize them correctly. For example, `__instance` refers to the instance of the class being patched.

## Setting Up Harmony

First, make sure you have Harmony referenced in your project. If you're using the BepInEx template, this should already be included. You'll need to add this using statement to your plugin file:

```cs
using HarmonyLib;
```

In your plugin's `Awake` method, create and apply your Harmony patches:

```cs
[BepInPlugin(PluginInfo.PLUGIN_GUID, PluginInfo.PLUGIN_NAME, PluginInfo.PLUGIN_VERSION)]
public class MyPlugin : BaseUnityPlugin
{
    private void Awake()
    {
        // Create a Harmony instance with a unique ID
        var harmony = new Harmony("com.yourname.yourmod");
        
        // Apply all patches in your assembly
        harmony.PatchAll();
        
        Logger.LogInfo($"Plugin {PluginInfo.PLUGIN_NAME} is loaded!");
    }
}
```

:::tip
Using `harmony.PatchAll()` will automatically find and apply all Harmony patches in your mod. Alternatively, you can use `harmony.PatchAll(typeof(MyPatchClass))` to only apply patches from a specific class.
:::

## Basic Patch Types

### Postfix Patches

Postfix patches run **after** the original method completes. This is the most common type of patch and is useful for:
- Reacting to game events
- Modifying return values
- Adding additional behavior after the original code runs

```cs
[HarmonyPatch(typeof(Hand), nameof(Hand.Update))]
public class HandUpdatePatch
{
    static void Postfix(Hand __instance)
    {
        // This code runs after Hand.Update() completes
        // __instance gives you access to the Hand object
        
        // Example: Log when the hand updates
        // Debug.Log($"Hand position: {__instance.transform.position}");
    }
}
```

:::tip
Harmony recognizes patch methods by their name: `Prefix`, `Postfix`, or `Transpiler`. You can also use attributes like `[HarmonyPrefix]` if you prefer, but the method name approach is simpler.
:::

### Prefix Patches

Prefix patches run **before** the original method executes. They can:
- Prevent the original method from running
- Modify parameters before they're used
- Add checks or validation

```cs
[HarmonyPatch(typeof(FlashlightControl), nameof(FlashlightControl.Update))]
public class FlashlightUpdatePatch
{
    static bool Prefix(FlashlightControl __instance)
    {
        // This code runs before FlashlightControl.Update()
        
        // Return false to prevent the original method from running
        // Return true to let it run normally
        
        // Example: Disable flashlight updates under certain conditions
        // if (someCondition)
        // {
        //     return false; // Skip the original method
        // }
        
        return true; // Run the original method
    }
}
```

### Transpiler Patches

Transpiler patches modify the IL (Intermediate Language) code of the original method. These are advanced and allow you to:
- Change specific instructions in the method
- Optimize or alter game logic at a low level

Transpilers are complex and beyond the scope of this basic guide. See the [Harmony documentation](https://harmony.pardeike.net/articles/patching-transpiler.html) for details.

## Accessing Method Parameters

You can access the original method's parameters in your patch by including them in your patch method signature:

```cs
[HarmonyPatch(typeof(henryBrain), "moveToPlayer")]
public class HenryMovePatch
{
    static bool Prefix(henryBrain __instance)
    {
        // Access fields from the henryBrain instance
        // Example: Only allow movement under certain conditions
        // if (someCondition)
        // {
        //     return false; // Block the original method
        // }
        return true;
    }
}
```

For methods with parameters, include them in your patch method:

```cs
// If the original method is: void SomeMethod(int value, string text)
[HarmonyPatch(typeof(SomeClass), nameof(SomeClass.SomeMethod))]
public class SomeMethodPatch
{
    static void Prefix(SomeClass __instance, int value, string text)
    {
        // You now have access to value and text parameters
    }
}
```

## Modifying Return Values

Postfix patches can modify the return value of a method using the `__result` parameter:

```cs
[HarmonyPatch(typeof(SomeClass), nameof(SomeClass.GetSpeed))]
public class GetSpeedPatch
{
    static void Postfix(ref float __result)
    {
        // Modify the return value
        __result *= 2f; // Double the speed
    }
}
```

:::warning IMPORTANT
Use `ref` keyword with `__result` to modify the return value.
:::

## Practical Examples

### Example 1: Logging Enemy Behavior

```cs
[HarmonyPatch(typeof(henryBrain), "playerDistFuncStateControl")]
public class LogHenryBehaviorPatch
{
    static void Postfix(henryBrain __instance)
    {
        // Log when Henry gets close to the player
        float distance = Vector3.Distance(__instance.player.transform.position, 
                                         __instance.transform.position);
        
        if (distance < 3f)
        {
            Debug.Log($"Henry is close! Distance: {distance}");
        }
    }
}
```

### Example 2: Modifying Flashlight Behavior

```cs
[HarmonyPatch(typeof(FlashlightControl), "FixedUpdate")]
public class ModifyFlashlightPatch
{
    static void Prefix(FlashlightControl __instance)
    {
        // Reduce flashlight energy cost
        __instance.flashlightEnergyCost *= 0.5f;
    }
}
```

### Example 3: Preventing Death

```cs
[HarmonyPatch(typeof(jumpscareController), "onDeathHenry")]
public class PreventDeathPatch
{
    static bool Prefix()
    {
        // Return false to prevent the death from happening
        Debug.Log("Death prevented by mod!");
        return false;
    }
}
```

## Patching Private Methods

You can patch private methods using a string for the method name:

```cs
[HarmonyPatch(typeof(Hand), "sethand")]
public class HandSetPatch
{
    static void Postfix(Hand __instance)
    {
        // Patch the private sethand method
    }
}
```

## Organizing Your Patches

It's good practice to organize your patches into separate classes:

```cs
internal class PlayerPatches
{
    [HarmonyPatch(typeof(Hand), nameof(Hand.Update))]
    public class HandUpdatePatch
    {
        static void Postfix(Hand __instance)
        {
            // Hand-related patches
        }
    }
    
    [HarmonyPatch(typeof(Body), nameof(Body.Start))]
    public class BodyStartPatch
    {
        static void Postfix(Body __instance)
        {
            // Body-related patches
        }
    }
}

internal class EnemyPatches
{
    [HarmonyPatch(typeof(henryBrain), "moveToPlayer")]
    public class HenryMovePatch
    {
        static bool Prefix(henryBrain __instance)
        {
            // Enemy AI patches
            return true;
        }
    }
}
```

## Best Practices

1. **Use descriptive class names** - Name your patch classes clearly (e.g., `HenryMovePatch`, `FlashlightUpdatePatch`)
2. **Minimize performance impact** - Avoid heavy operations in frequently-called methods like `Update()`
3. **Handle edge cases** - Check for null references and invalid states
4. **Log appropriately** - Use logging to debug, but don't spam the console
5. **Test thoroughly** - Patches can have unexpected interactions with other mods
6. **Document your patches** - Add comments explaining what your patch does and why
7. **Use `static` methods** - Harmony patch methods must be static

## Common Pitfalls

- **Forgetting `__instance`** - You need this to access the object's fields and methods
- **Wrong parameter names** - Harmony requires specific names like `__instance` and `__result`
- **Not calling the original** - In prefix patches, forgetting to return true prevents the original from running
- **Performance issues** - Patching `Update()` or `FixedUpdate()` with heavy code can cause lag
- **Mod conflicts** - Multiple mods patching the same method can cause issues

## Further Reading

For more advanced Harmony usage, see the official documentation:
- [Harmony Documentation](https://harmony.pardeike.net/articles/intro.html)
- [HarmonyX Wiki](https://github.com/BepInEx/HarmonyX/wiki)
- [Patching Examples](https://harmony.pardeike.net/articles/patching.html)

## Next Steps

Now that you understand patching, you can:
- Explore the game's code using [Reading Game Code](/dev/fundamentals/reading-game-code)
- Add configuration options with [Custom Configs](/dev/intermediate/custom-configs)
- Create custom content with [Asset Bundling](/dev/intermediate/asset-bundling)
